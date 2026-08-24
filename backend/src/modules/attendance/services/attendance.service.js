const { Op, fn, col } = require('sequelize');
const {
  Staff, ClassTeacherAssignment, Section, ClassGroup, AcademicSession,
  AttendanceSession, AttendanceRecord, Enrollment, Student, User,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Internal helper ─────────────────────────────────────────────────────────────

const resolveStaffId = async (userId) => {
  const staff = await Staff.findOne({ where: { user_id: userId } });
  if (!staff) throw new ApiError(403, 'No staff record is linked to your account');
  return staff.id;
};

// Returns true when any rule contributing to the merged ability grants `action` on
// `subjectType` with no conditions at all — i.e. full, campus-wide authority, as
// opposed to a relational rule (e.g. Teacher's `{ scope: 'own' }` marker) that
// requires the service to do its own ClassTeacherAssignment lookup.
const isUnrestricted = (ability, action, subjectType) => (
  ability.possibleRulesFor(action, subjectType).some((rule) => !rule.inverted && !rule.conditions)
);

// Attaches per-section attendance stats for a given date to a base row list.
// Module-private — the stats query pattern is specific to this landing-page shape.
const attachAttendanceStats = async (baseRows, { campusIdInt, academicSessionId, date }) => {
  if (baseRows.length === 0) return baseRows;

  const sectionIds = baseRows.map((row) => row.sectionId);

  const enrollmentCounts = await Enrollment.findAll({
    attributes: ['section_id', [fn('COUNT', col('id')), 'count']],
    where: { section_id: { [Op.in]: sectionIds }, status: 'active' },
    group: ['section_id'],
    raw: true,
  });
  const enrolledCountBySection = Object.fromEntries(
    enrollmentCounts.map((row) => [row.section_id, parseInt(row.count, 10)]),
  );

  const attendanceSessions = await AttendanceSession.findAll({
    where: {
      campus_id: campusIdInt,
      session_id: academicSessionId,
      section_id: { [Op.in]: sectionIds },
      date,
    },
    include: [{ model: User, as: 'markedBy', attributes: ['id', 'first_name', 'last_name'] }],
  });
  const sessionBySectionId = Object.fromEntries(
    attendanceSessions.map((session) => [session.section_id, session]),
  );

  const attendanceSessionIds = attendanceSessions.map((session) => session.id);
  const statusCounts = attendanceSessionIds.length
    ? await AttendanceRecord.findAll({
      attributes: ['attendance_session_id', 'status', [fn('COUNT', col('id')), 'count']],
      where: { attendance_session_id: { [Op.in]: attendanceSessionIds } },
      group: ['attendance_session_id', 'status'],
      raw: true,
    })
    : [];

  const breakdownBySessionId = {};
  statusCounts.forEach((row) => {
    const sid = row.attendance_session_id;
    if (!breakdownBySessionId[sid]) breakdownBySessionId[sid] = { present: 0, absent: 0, late: 0, leave: 0 };
    breakdownBySessionId[sid][row.status] = parseInt(row.count, 10);
  });

  return baseRows.map((row) => {
    const enrolledCount = enrolledCountBySection[row.sectionId] ?? 0;
    const attendanceSession = sessionBySectionId[row.sectionId];

    if (!attendanceSession) {
      return { ...row, registerStatus: 'not_marked', enrolledCount };
    }

    const breakdown = breakdownBySessionId[attendanceSession.id] ?? { present: 0, absent: 0, late: 0, leave: 0 };
    const recordCount = breakdown.present + breakdown.absent + breakdown.late + breakdown.leave;

    return {
      ...row,
      registerStatus: attendanceSession.status, // 'draft' | 'submitted'
      enrolledCount,
      recordCount,
      breakdown,
      submittedAt: attendanceSession.submitted_at,
      markedByName: attendanceSession.markedBy
        ? `${attendanceSession.markedBy.first_name} ${attendanceSession.markedBy.last_name}`
        : null,
      attendanceSessionId: attendanceSession.id,
    };
  });
};

// ── My sections ──────────────────────────────────────────────────────────────────

const getMySections = async ({ ability, userId, campusId, sessionId, date }) => {
  const campusIdInt = parseInt(campusId);
  const academicSessionId = parseInt(sessionId);

  let baseRows;

  if (isUnrestricted(ability, 'read', 'Attendance')) {
    const classGroups = await ClassGroup.findAll({
      where: { campus_id: campusIdInt },
      include: [
        { model: Section, as: 'sections', required: true },
        { model: AcademicSession, as: 'session', required: true, where: { id: academicSessionId } },
      ],
      order: [['level', 'ASC']],
    });

    baseRows = classGroups.flatMap((classGroup) => classGroup.sections.map((section) => ({
      sectionId: section.id,
      sectionName: section.name,
      classGroupId: classGroup.id,
      className: classGroup.name,
      sessionId: classGroup.session.id,
      sessionName: classGroup.session.name,
    })));
  } else {
    const staffId = await resolveStaffId(userId);

    const assignments = await ClassTeacherAssignment.findAll({
      where: { campus_id: campusIdInt, staff_id: staffId },
      include: [
        {
          model: Section,
          as: 'section',
          required: true,
          include: [
            {
              model: ClassGroup,
              as: 'classGroup',
              required: true,
              include: [
                { model: AcademicSession, as: 'session', required: true, where: { id: academicSessionId } },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Section, as: 'section' }, { model: ClassGroup, as: 'classGroup' }, 'level', 'ASC']],
    });

    baseRows = assignments.map((assignment) => ({
      sectionId: assignment.section.id,
      sectionName: assignment.section.name,
      classGroupId: assignment.section.classGroup.id,
      className: assignment.section.classGroup.name,
      sessionId: assignment.section.classGroup.session.id,
      sessionName: assignment.section.classGroup.session.name,
    }));
  }

  return attachAttendanceStats(baseRows, { campusIdInt, academicSessionId, date });
};

// ── Open / get register ───────────────────────────────────────────────────────────

const getOrCreateSession = async ({ ability, userId, campusId, sectionId, classGroupId, date }) => {
  const campusIdInt = parseInt(campusId);
  const unrestricted = isUnrestricted(ability, 'create', 'Attendance');

  let resolvedSectionId = sectionId ? parseInt(sectionId) : null;

  if (!resolvedSectionId && classGroupId) {
    const nullSection = await Section.findOne({
      where: { class_group_id: parseInt(classGroupId), name: null },
    });
    if (!nullSection) throw new ApiError(404, 'Section not found for this class');
    resolvedSectionId = nullSection.id;
  }

  if (!resolvedSectionId) throw new ApiError(400, 'sectionId or classGroupId is required');

  if (!unrestricted) {
    const staffId = await resolveStaffId(userId);
    const assignment = await ClassTeacherAssignment.findOne({
      where: { campus_id: campusIdInt, section_id: resolvedSectionId, staff_id: staffId },
    });
    if (!assignment) throw new ApiError(403, 'You are not assigned as class teacher for this section');
  }

  const section = await Section.findOne({
    where: { id: resolvedSectionId },
    include: [{ model: ClassGroup, as: 'classGroup', include: [{ model: AcademicSession, as: 'session' }] }],
  });
  if (!section) throw new ApiError(404, 'Section not found');

  if (unrestricted && section.classGroup.campus_id !== campusIdInt) {
    throw new ApiError(404, 'Section not found');
  }

  const academicSession = section.classGroup.session;
  if (academicSession.status === 'completed') {
    throw new ApiError(403, 'Attendance cannot be modified for a completed session');
  }

  const [attendanceSession, created] = await AttendanceSession.findOrCreate({
    where: {
      campus_id: campusIdInt,
      session_id: academicSession.id,
      section_id: resolvedSectionId,
      date,
    },
    defaults: { class_group_id: section.classGroup.id, marked_by: userId, status: 'draft' },
  });

  const students = (await Enrollment.findAll({
    where: { section_id: resolvedSectionId, status: 'active' },
    include: [{ model: Student, as: 'student', attributes: ['id', 'full_name', 'gr_no'] }],
    order: [['class_no', 'ASC']],
  })).map((enrollment) => ({
    studentId: enrollment.student.id,
    fullName: enrollment.student.full_name,
    grNo: enrollment.student.gr_no,
    classNo: enrollment.class_no,
  }));

  const records = (await AttendanceRecord.findAll({
    where: { attendance_session_id: attendanceSession.id },
  })).map((record) => ({
    studentId: record.student_id,
    status: record.status,
    remarks: record.remarks,
  }));

  return {
    session: {
      id: attendanceSession.id,
      date: attendanceSession.date,
      status: attendanceSession.status,
      submittedAt: attendanceSession.submitted_at,
      markedBy: attendanceSession.marked_by,
      className: section.classGroup.name,
      sectionName: section.name,
      sessionName: academicSession.name,
    },
    students,
    records,
    editable: attendanceSession.status !== 'submitted',
  };
};

// ── Save records ───────────────────────────────────────────────────────────────────

const saveRecords = async ({ ability, userId, campusId, attendanceSessionId, records }) => {
  const campusIdInt = parseInt(campusId);

  const attendanceSession = await AttendanceSession.findOne({
    where: { id: parseInt(attendanceSessionId), campus_id: campusIdInt },
  });
  if (!attendanceSession) throw new ApiError(404, 'Attendance session not found');
  if (attendanceSession.status === 'submitted') {
    throw new ApiError(409, 'This register has already been submitted and cannot be edited');
  }

  if (!isUnrestricted(ability, 'update', 'Attendance')) {
    const staffId = await resolveStaffId(userId);
    const assignment = await ClassTeacherAssignment.findOne({
      where: { campus_id: campusIdInt, section_id: attendanceSession.section_id, staff_id: staffId },
    });
    if (!assignment) throw new ApiError(403, 'You are not assigned as class teacher for this section');
  }

  const enrolledStudentIds = (await Enrollment.findAll({
    where: { section_id: attendanceSession.section_id, status: 'active' },
    attributes: ['student_id'],
  })).map((enrollment) => enrollment.student_id);

  const invalid = records.some((record) => !enrolledStudentIds.includes(parseInt(record.studentId)));
  if (invalid) throw new ApiError(400, 'One or more students are not enrolled in this section');

  for (const record of records) {
    await AttendanceRecord.upsert({
      attendance_session_id: attendanceSession.id,
      student_id: parseInt(record.studentId),
      status: record.status,
      remarks: record.remarks ?? null,
    });
  }

  attendanceSession.marked_by = userId;
  await attendanceSession.save();

  return AttendanceRecord.findAll({ where: { attendance_session_id: attendanceSession.id } });
};

// ── Submit ─────────────────────────────────────────────────────────────────────────

const submitSession = async ({ ability, userId, campusId, attendanceSessionId }) => {
  const campusIdInt = parseInt(campusId);

  const attendanceSession = await AttendanceSession.findOne({
    where: { id: parseInt(attendanceSessionId), campus_id: campusIdInt },
  });
  if (!attendanceSession) throw new ApiError(404, 'Attendance session not found');
  if (attendanceSession.status === 'submitted') throw new ApiError(409, 'Register is already submitted');

  if (!isUnrestricted(ability, 'submit', 'Attendance')) {
    const staffId = await resolveStaffId(userId);
    const assignment = await ClassTeacherAssignment.findOne({
      where: { campus_id: campusIdInt, section_id: attendanceSession.section_id, staff_id: staffId },
    });
    if (!assignment) throw new ApiError(403, 'You are not assigned as class teacher for this section');
  }

  const academicSession = await AcademicSession.findByPk(attendanceSession.session_id);
  if (!['active', 'closing'].includes(academicSession.status)) {
    throw new ApiError(403, 'Attendance cannot be modified for a completed session');
  }

  const enrolledCount = await Enrollment.count({
    where: { section_id: attendanceSession.section_id, status: 'active' },
  });

  const recordCount = await AttendanceRecord.count({
    where: { attendance_session_id: attendanceSession.id },
  });

  if (recordCount < enrolledCount) {
    throw new ApiError(
      400,
      `Cannot submit — ${enrolledCount - recordCount} student(s) are not marked yet. Save progress and mark everyone before submitting.`,
    );
  }

  attendanceSession.status = 'submitted';
  attendanceSession.submitted_at = new Date();
  attendanceSession.marked_by = userId;
  await attendanceSession.save();

  return attendanceSession;
};

// ── Reopen ─────────────────────────────────────────────────────────────────────────

const reopenSession = async ({ campusId, attendanceSessionId }) => {
  const campusIdInt = parseInt(campusId);

  const attendanceSession = await AttendanceSession.findOne({
    where: { id: parseInt(attendanceSessionId), campus_id: campusIdInt },
  });
  if (!attendanceSession) throw new ApiError(404, 'Attendance session not found');
  if (attendanceSession.status !== 'submitted') {
    throw new ApiError(409, 'Only a submitted register can be reopened');
  }

  const academicSession = await AcademicSession.findByPk(attendanceSession.session_id);
  if (academicSession.status === 'completed') {
    throw new ApiError(403, 'Attendance cannot be modified for a completed session');
  }

  attendanceSession.status = 'draft';
  attendanceSession.submitted_at = null;
  await attendanceSession.save();

  return attendanceSession;
};

// ── Update remarks (standalone, post-submission) ──────────────────────────────────

const updateRemarks = async ({ campusId, recordId, remarks }) => {
  const campusIdInt = parseInt(campusId);

  const record = await AttendanceRecord.findOne({
    where: { id: parseInt(recordId) },
    include: [
      {
        model: AttendanceSession,
        as: 'attendanceSession',
        required: true,
        where: { campus_id: campusIdInt },
      },
    ],
  });
  if (!record) throw new ApiError(404, 'Attendance record not found');

  record.remarks = remarks ?? null;
  await record.save();

  return record;
};

module.exports = {
  getMySections, getOrCreateSession, saveRecords, submitSession, reopenSession, updateRemarks,
};

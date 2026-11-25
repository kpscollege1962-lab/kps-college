const { Op, fn, col } = require('sequelize');
const {
  sequelize, Section, ClassGroup, AcademicSession,
  AttendanceSession, AttendanceRecord, Enrollment, Student, StudentContact, User,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { localToday } = require('../../rota/utils/localDate');
const {
  isMyFormMasterClass, listMyFormMasterClasses, listCampusFormMasters,
} = require('../../teacher/utils/formMaster');

// ── Who marks a register ─────────────────────────────────────────────────────────
// The FORM MASTER of the class (the teacher of its Period 1, the first teaching period; assembly
// never counts) takes its attendance. On a day with an ISSUED rota, the teacher covering that
// class's Period 1 counts as its form master that day. Admins (unconditioned rules) may act on
// any register of their campus. The "Class teachers" assignments no longer decide attendance.

const userName = (u) => (u ? [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || null : null);

// Returns true when any rule contributing to the merged ability grants `action` on
// `subjectType` with no conditions at all — i.e. full, campus-wide authority, as
// opposed to a relational rule (e.g. Teacher's `{ scope: 'own' }` marker) that
// requires the service to check the form master rule itself.
const isUnrestricted = (ability, action, subjectType) => (
  ability.possibleRulesFor(action, subjectType).some((rule) => !rule.inverted && !rule.conditions)
);

const dayOf = (date) => (date ? String(date).slice(0, 10) : localToday());

const assertMayMark = async ({ userId, campusIdInt, classGroupId, sectionId, date }) => {
  const ok = await isMyFormMasterClass(userId, campusIdInt, Number(classGroupId), Number(sectionId), { date: dayOf(date) });
  if (!ok) throw new ApiError(403, 'Only the form master (Period 1 teacher) of this class takes its attendance');
};

// Can this register (date + its attendance session, if any) still be changed?
//   - never for a future date or a completed academic session, never once submitted;
//   - a teacher marks TODAY; a past day only when its register already exists as a draft
//     (started that day, or reopened by an admin). Admins may also start a past register.
const LOCK_MESSAGES = {
  'view-only':      'You can view attendance but not change it.',
  future:           'Attendance cannot be taken for a future date.',
  'session-closed': 'Attendance cannot be modified for a completed session.',
  submitted:        'This attendance is already submitted. Ask the office to reopen it to make changes.',
  past:             'Attendance is taken on the day: a past day can only be changed after the office reopens it.',
};
const editState = ({ canUpdate, unrestricted, attendanceSession, academicSession, date }) => {
  const reason = (() => {
    if (!canUpdate) return 'view-only';
    if (date > localToday()) return 'future';
    if (!['active', 'closing'].includes(academicSession?.status)) return 'session-closed';
    if (attendanceSession?.status === 'submitted') return 'submitted';
    if (!unrestricted && date < localToday() && !attendanceSession) return 'past';
    return null;
  })();
  return { editable: reason === null, lockedReason: reason };
};
const assertEditable = (state) => {
  if (state.editable) return;
  throw new ApiError(state.lockedReason === 'submitted' ? 409 : 422, LOCK_MESSAGES[state.lockedReason]);
};

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
    include: [{ model: User, as: 'markedBy', attributes: ['id', 'first_name', 'last_name', 'username'] }],
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
      markedByName: userName(attendanceSession.markedBy),
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
      order: [['level', 'ASC'], [{ model: Section, as: 'sections' }, 'name', 'ASC']],
    });

    baseRows = classGroups.flatMap((classGroup) => classGroup.sections.map((section) => ({
      sectionId: section.id,
      sectionName: section.name,
      classGroupId: classGroup.id,
      className: classGroup.name,
      sessionId: classGroup.session.id,
      sessionName: classGroup.session.name,
    })));

    const masters = await listCampusFormMasters(campusIdInt, academicSessionId);
    baseRows = baseRows.map((row) => ({
      ...row,
      formMasterNames: masters
        .filter((m) => m.classGroupId === row.classGroupId && m.sectionId === row.sectionId)
        .map((m) => m.staffName),
    }));
  } else {
    // Teachers: the classes they are form master of on that date (rota Period 1 cover included).
    const mine = await listMyFormMasterClasses(userId, campusIdInt, { date: dayOf(date) });
    const groups = mine.length
      ? await ClassGroup.findAll({
        where: { id: { [Op.in]: mine.map((c) => c.classGroupId) }, campus_id: campusIdInt, session_id: academicSessionId },
        include: [{ model: AcademicSession, as: 'session' }],
      })
      : [];
    const groupById = new Map(groups.map((g) => [g.id, g]));
    baseRows = mine
      .filter((c) => groupById.has(c.classGroupId))
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || String(a.sectionName ?? '').localeCompare(String(b.sectionName ?? '')))
      .map((c) => ({
        sectionId: c.sectionId,
        sectionName: c.sectionName,
        classGroupId: c.classGroupId,
        className: c.className,
        sessionId: academicSessionId,
        sessionName: groupById.get(c.classGroupId).session?.name ?? null,
        rotaToday: c.viaRota,
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

  const section = await Section.findOne({
    where: { id: resolvedSectionId },
    include: [{ model: ClassGroup, as: 'classGroup', include: [{ model: AcademicSession, as: 'session' }] }],
  });
  if (!section || section.classGroup.campus_id !== campusIdInt) throw new ApiError(404, 'Section not found');

  if (!unrestricted) {
    await assertMayMark({ userId, campusIdInt, classGroupId: section.classGroup.id, sectionId: resolvedSectionId, date });
  }

  const academicSession = section.classGroup.session;
  if (academicSession.status === 'completed') {
    throw new ApiError(403, 'Attendance cannot be modified for a completed session');
  }
  const existing = await AttendanceSession.findOne({
    where: { campus_id: campusIdInt, session_id: academicSession.id, section_id: resolvedSectionId, date },
  });
  if (!existing) {
    assertEditable(editState({ canUpdate: true, unrestricted, attendanceSession: null, academicSession, date: dayOf(date) }));
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
    await assertMayMark({
      userId, campusIdInt, classGroupId: attendanceSession.class_group_id, sectionId: attendanceSession.section_id, date: attendanceSession.date,
    });
    if (dayOf(attendanceSession.date) > localToday()) throw new ApiError(422, LOCK_MESSAGES.future);
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
    await assertMayMark({
      userId, campusIdInt, classGroupId: attendanceSession.class_group_id, sectionId: attendanceSession.section_id, date: attendanceSession.date,
    });
    if (dayOf(attendanceSession.date) > localToday()) throw new ApiError(422, LOCK_MESSAGES.future);
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

// ── Register: one class on one date (the class page "Attendance" tab and the admin view) ──

const loadSection = async (campusIdInt, sectionId) => {
  const section = await Section.findOne({
    where: { id: parseInt(sectionId) },
    include: [{
      model: ClassGroup, as: 'classGroup', required: true, where: { campus_id: campusIdInt },
      include: [{ model: AcademicSession, as: 'session' }],
    }],
  });
  if (!section) throw new ApiError(404, 'Class not found');
  return section;
};

const findDay = (campusIdInt, section, date, transaction) => AttendanceSession.findOne({
  where: { campus_id: campusIdInt, session_id: section.classGroup.session_id, section_id: section.id, date },
  include: [{ model: User, as: 'markedBy', attributes: ['id', 'first_name', 'last_name', 'username'] }],
  transaction,
});

// Reads never create anything. Admin / principal readers (read AttendanceReports) also get each
// student's parent / guardian contacts.
const getRegister = async ({ ability, userId, campusId, sectionId, date }) => {
  const campusIdInt = parseInt(campusId);
  const day = dayOf(date);
  const section = await loadSection(campusIdInt, sectionId);
  const unrestricted = isUnrestricted(ability, 'read', 'Attendance');
  if (!unrestricted) {
    await assertMayMark({ userId, campusIdInt, classGroupId: section.classGroup.id, sectionId: section.id, date: day });
  }
  const withContacts = ability.can('read', 'AttendanceReports');

  const [attendanceSession, enrollments, masters] = await Promise.all([
    findDay(campusIdInt, section, day),
    Enrollment.findAll({
      where: { section_id: section.id, status: 'active' },
      include: [{
        model: Student, as: 'student', required: true, attributes: ['id', 'full_name', 'gr_no', 'gender', 'father_name'],
        include: withContacts
          ? [{ model: StudentContact, as: 'contacts', attributes: ['id', 'label', 'name', 'phone', 'is_primary', 'gender'] }]
          : [],
      }],
      order: [['class_no', 'ASC']],
    }),
    listCampusFormMasters(campusIdInt, section.classGroup.session_id),
  ]);
  const records = attendanceSession
    ? await AttendanceRecord.findAll({ where: { attendance_session_id: attendanceSession.id } })
    : [];

  const state = editState({
    canUpdate: ability.can('update', 'Attendance'),
    unrestricted: isUnrestricted(ability, 'update', 'Attendance'),
    attendanceSession,
    academicSession: section.classGroup.session,
    date: day,
  });

  return {
    class: {
      classGroupId: section.classGroup.id,
      className: section.classGroup.name,
      sectionId: section.id,
      sectionName: section.name,
    },
    date: day,
    session: attendanceSession ? {
      id: attendanceSession.id,
      status: attendanceSession.status,
      submittedAt: attendanceSession.submitted_at,
      updatedAt: attendanceSession.updatedAt,
      markedByName: userName(attendanceSession.markedBy),
    } : null,
    formMasterNames: masters
      .filter((m) => m.classGroupId === section.classGroup.id && m.sectionId === section.id)
      .map((m) => m.staffName),
    students: enrollments.map((e) => ({
      studentId: e.student.id,
      fullName: e.student.full_name,
      fatherName: e.student.father_name,
      grNo: e.student.gr_no,
      classNo: e.class_no,
      ...(withContacts ? {
        contacts: [...(e.student.contacts ?? [])]
          .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
          .map((c) => ({ id: c.id, label: c.label, name: c.name, phone: c.phone, isPrimary: Boolean(c.is_primary) })),
      } : {}),
    })),
    records: records.map((r) => ({ studentId: r.student_id, status: r.status, remarks: r.remarks })),
    editable: state.editable,
    lockedReason: state.lockedReason,
    lockedMessage: state.lockedReason ? LOCK_MESSAGES[state.lockedReason] : null,
    canSubmit: ability.can('submit', 'Attendance'),
    canReopen: ability.can('reopen', 'Attendance') && attendanceSession?.status === 'submitted',
  };
};

// Saves the marks (creating the day's register on the first save) and, with `submit`, locks it:
// every enrolled student must be marked. One transaction.
const saveRegister = async ({ ability, userId, campusId, sectionId, date, records, submit }) => {
  const campusIdInt = parseInt(campusId);
  const day = dayOf(date);
  const section = await loadSection(campusIdInt, sectionId);
  const unrestricted = isUnrestricted(ability, 'update', 'Attendance');
  if (!unrestricted) {
    await assertMayMark({ userId, campusIdInt, classGroupId: section.classGroup.id, sectionId: section.id, date: day });
  }
  if (submit && !ability.can('submit', 'Attendance')) throw new ApiError(403, 'You cannot submit attendance');

  await sequelize.transaction(async (transaction) => {
    let attendanceSession = await findDay(campusIdInt, section, day, transaction);
    assertEditable(editState({
      canUpdate: true, unrestricted, attendanceSession, academicSession: section.classGroup.session, date: day,
    }));

    const enrolled = new Set((await Enrollment.findAll({
      where: { section_id: section.id, status: 'active' }, attributes: ['student_id'], transaction,
    })).map((e) => e.student_id));
    if (records.some((r) => !enrolled.has(parseInt(r.studentId)))) {
      throw new ApiError(400, 'One or more students are not enrolled in this class');
    }

    if (!attendanceSession) {
      attendanceSession = await AttendanceSession.create({
        campus_id: campusIdInt,
        session_id: section.classGroup.session_id,
        class_group_id: section.classGroup.id,
        section_id: section.id,
        date: day,
        marked_by: userId,
        status: 'draft',
      }, { transaction });
    }

    for (const r of records) {
      const remarks = typeof r.remarks === 'string' && r.remarks.trim() ? r.remarks.trim() : null;
      await AttendanceRecord.upsert({
        attendance_session_id: attendanceSession.id,
        student_id: parseInt(r.studentId),
        status: r.status,
        remarks: r.status === 'present' ? null : remarks,
      }, { transaction });
    }

    attendanceSession.marked_by = userId;
    if (submit) {
      const marked = await AttendanceRecord.count({
        where: { attendance_session_id: attendanceSession.id, student_id: { [Op.in]: [...enrolled] } },
        transaction,
      });
      if (marked < enrolled.size) {
        throw new ApiError(422, `Mark every student before submitting: ${enrolled.size - marked} not marked yet.`);
      }
      attendanceSession.status = 'submitted';
      attendanceSession.submitted_at = new Date();
    }
    attendanceSession.changed('updatedAt', true);
    await attendanceSession.save({ transaction });
  });

  return getRegister({ ability, userId, campusId, sectionId, date: day });
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
  getRegister, saveRegister,
};

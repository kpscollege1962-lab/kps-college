const { Op } = require('sequelize');
const {
  AttendanceRecord, AttendanceSession, Section, ClassGroup, Student, StudentContact, Enrollment, AcademicSession,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const getStatusListReport = async ({ campusId, sessionId, dateFrom, dateTo, statuses }) => {
  const campusIdInt = parseInt(campusId);
  const academicSessionId = parseInt(sessionId);
  const statusFilter = statuses && statuses.length ? statuses : ['absent'];

  const records = await AttendanceRecord.findAll({
    where: { status: { [Op.in]: statusFilter } },
    include: [
      {
        model: AttendanceSession,
        as: 'attendanceSession',
        required: true,
        where: {
          campus_id: campusIdInt,
          session_id: academicSessionId,
          status: 'submitted',
          date: { [Op.between]: [dateFrom, dateTo] },
        },
        include: [
          {
            model: Section,
            as: 'section',
            required: true,
            include: [{ model: ClassGroup, as: 'classGroup', required: true }],
          },
        ],
      },
      {
        model: Student,
        as: 'student',
        required: true,
        include: [
          {
            model: StudentContact,
            as: 'contacts',
            attributes: ['id', 'label', 'name', 'phone', 'is_primary'],
          },
        ],
      },
    ],
    order: [
      [{ model: AttendanceSession, as: 'attendanceSession' }, 'date', 'ASC'],
      [
        { model: AttendanceSession, as: 'attendanceSession' },
        { model: Section, as: 'section' },
        { model: ClassGroup, as: 'classGroup' },
        'level', 'ASC',
      ],
    ],
  });

  return records.map((record) => ({
    date: record.attendanceSession.date,
    classGroupId: record.attendanceSession.section.classGroup.id,
    className: record.attendanceSession.section.classGroup.name,
    sectionId: record.attendanceSession.section.id,
    sectionName: record.attendanceSession.section.name,
    recordId: record.id,
    studentId: record.student.id,
    grNo: record.student.gr_no,
    studentName: record.student.full_name,
    fatherName: record.student.father_name,
    contacts: record.student.contacts.map((c) => ({
      id: c.id,
      label: c.label,
      name: c.name,
      phone: c.phone,
      isPrimary: Boolean(c.is_primary),
    })),
    status: record.status,
    remarks: record.remarks,
  }));
};

const listReportSections = async ({ campusId, sessionId }) => {
  const campusIdInt = parseInt(campusId);
  const academicSessionId = parseInt(sessionId);

  const classGroups = await ClassGroup.findAll({
    where: { campus_id: campusIdInt },
    include: [
      { model: Section, as: 'sections', required: true },
      { model: AcademicSession, as: 'session', required: true, where: { id: academicSessionId } },
    ],
    order: [['level', 'ASC']],
  });

  return classGroups.flatMap((classGroup) => classGroup.sections.map((section) => ({
    sectionId: section.id,
    sectionName: section.name,
    classGroupId: classGroup.id,
    className: classGroup.name,
  })));
};

const getClassRegisterReport = async ({ campusId, sessionId, sectionId, dateFrom, dateTo }) => {
  const campusIdInt = parseInt(campusId);
  const academicSessionId = parseInt(sessionId);
  const sectionIdInt = parseInt(sectionId);

  const section = await Section.findOne({
    where: { id: sectionIdInt },
    include: [{ model: ClassGroup, as: 'classGroup', required: true, where: { campus_id: campusIdInt } }],
  });
  if (!section) throw new ApiError(404, 'Section not found');

  const enrollments = await Enrollment.findAll({
    where: { section_id: sectionIdInt, status: 'active' },
    include: [{ model: Student, as: 'student', required: true }],
  });
  const students = enrollments
    .map((e) => e.student)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const attendanceSessions = await AttendanceSession.findAll({
    where: {
      campus_id: campusIdInt,
      session_id: academicSessionId,
      section_id: sectionIdInt,
      status: 'submitted',
      date: { [Op.between]: [dateFrom, dateTo] },
    },
    order: [['date', 'ASC']],
  });

  const dates = attendanceSessions.map((s) => s.date);
  const sessionIdsByDate = Object.fromEntries(attendanceSessions.map((s) => [s.date, s.id]));
  const attendanceSessionIds = attendanceSessions.map((s) => s.id);

  const records = attendanceSessionIds.length
    ? await AttendanceRecord.findAll({
      where: { attendance_session_id: { [Op.in]: attendanceSessionIds } },
      attributes: ['attendance_session_id', 'student_id', 'status'],
      raw: true,
    })
    : [];

  const statusByStudentAndSession = {};
  records.forEach((r) => {
    statusByStudentAndSession[`${r.student_id}_${r.attendance_session_id}`] = r.status;
  });

  const studentRows = students.map((student) => {
    const recordsByDate = {};
    const totals = { present: 0, absent: 0, late: 0, leave: 0 };

    dates.forEach((date) => {
      const sessId = sessionIdsByDate[date];
      const status = statusByStudentAndSession[`${student.id}_${sessId}`] ?? null;
      recordsByDate[date] = status;
      if (status) totals[status] += 1;
    });

    const percentage = dates.length > 0 ? Math.round((totals.present / dates.length) * 100) : 0;

    return {
      studentId: student.id,
      grNo: student.gr_no,
      studentName: student.full_name,
      recordsByDate,
      totals,
      percentage,
    };
  });

  return {
    section: { sectionId: section.id, sectionName: section.name, className: section.classGroup.name },
    dates,
    students: studentRows,
  };
};

module.exports = { getStatusListReport, listReportSections, getClassRegisterReport };

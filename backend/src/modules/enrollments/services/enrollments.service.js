const { Op } = require('sequelize');
const { Enrollment, Student, Section, ClassGroup, AcademicSession, Campus } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Get one ────────────────────────────────────────────────────────────────────

const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId, {
    include: [
      { model: ClassGroup, as: 'classGroup' },
      { model: Student, as: 'student' },
      { model: Section, as: 'section', required: false },
      { model: AcademicSession, as: 'session' },
    ],
  });
  if (!enrollment) throw new ApiError(404, 'Enrollment not found');
  return enrollment;
};

// ── List ───────────────────────────────────────────────────────────────────────

const listEnrollments = async ({ campusId, sessionId, classGroupId, sectionId, status, search, page = 1, limit = 20 }) => {
  const where = {};

  if (campusId) where.campus_id = parseInt(campusId);
  if (sessionId) where.session_id = parseInt(sessionId);
  if (classGroupId) where.class_group_id = parseInt(classGroupId);
  if (sectionId) where.section_id = parseInt(sectionId);
  if (status !== undefined) where.status = status;

  let studentWhere = {};
  let studentRequired = false;

  if (search) {
    studentWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { gr_no: { [Op.like]: `%${search}%` } },
    ];
    studentRequired = true;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Enrollment.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        as: 'student',
        required: studentRequired,
        where: search ? studentWhere : undefined,
        attributes: ['id', 'full_name', 'gr_no', 'gender'],
      },
      {
        model: Campus,
        as: 'campus',
        attributes: ['id', 'name'],
      },
      {
        model: ClassGroup,
        as: 'classGroup',
        attributes: ['id', 'name', 'level'],
      },
      {
        model: Section,
        as: 'section',
        required: false,
        attributes: ['id', 'name'],
      },
    ],
    order: [['class_no', 'ASC']],
    limit,
    offset,
    distinct: true,
  });

  return { data: rows, total: count, page, limit };
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createEnrollment = async ({ campusId, sessionId, studentId, classGroupId, sectionId }, transaction = null) => {
  const campusIdInt     = parseInt(campusId);
  const sessionIdInt    = parseInt(sessionId);
  const studentIdInt    = parseInt(studentId);
  const classGroupIdInt = parseInt(classGroupId);

  // ── Validate session ───────────────────────────────────────────────────────
  const session = await AcademicSession.findByPk(sessionIdInt, { transaction });
  if (!session) throw new ApiError(404, 'Academic session not found');
  if (!['upcoming', 'active'].includes(session.status)) {
    throw new ApiError(422, 'New enrollments can only be created for upcoming or active sessions');
  }

  // ── Validate classGroup belongs to campusId + sessionId ────────────────────
  const classGroup = await ClassGroup.findOne({
    where: { id: classGroupIdInt, campus_id: campusIdInt, session_id: sessionIdInt },
    transaction,
  });
  if (!classGroup) throw new ApiError(404, 'Class not found for this campus and session');

  // ── Validate student ───────────────────────────────────────────────────────
  const student = await Student.findByPk(studentIdInt, { transaction });
  if (!student) throw new ApiError(404, 'Student not found');

  // ── Check one active enrollment per student per session ────────────────────
  const existingEnrollment = await Enrollment.findOne({
    where: { student_id: studentIdInt, session_id: sessionIdInt, status: 'active' },
    transaction,
  });
  if (existingEnrollment) {
    throw new ApiError(409, 'This student already has an active enrollment in this session');
  }

  // ── Resolve section ────────────────────────────────────────────────────────
  let resolvedSectionId;

  if (sectionId !== undefined && sectionId !== null) {
    // Client sent a sectionId — validate it
    const sectionIdInt = parseInt(sectionId);
    const section = await Section.findOne({
      where: { id: sectionIdInt, class_group_id: classGroupIdInt },
      transaction,
    });
    if (!section) throw new ApiError(404, 'Section not found for this class');
    if (section.name === null) {
      throw new ApiError(400, 'Cannot enroll into the default section directly. The section ID sent refers to an internal unsectioned placeholder.');
    }
    resolvedSectionId = sectionIdInt;
  } else {
    // No sectionId sent — class should be unsectioned, find the null section
    const nullSection = await Section.findOne({
      where: { class_group_id: classGroupIdInt, name: null },
      transaction,
    });
    if (!nullSection) {
      // Class has named sections but none was sent
      throw new ApiError(422, 'This class has sections. Please select a section to enroll the student into.');
    }
    resolvedSectionId = nullSection.id;
  }

  // ── Assign class_no (section-scoped) ──────────────────────────────────────
  const maxClassNo = await Enrollment.max('class_no', {
    where: {
      campus_id:      campusIdInt,
      session_id:     sessionIdInt,
      class_group_id: classGroupIdInt,
      section_id:     resolvedSectionId,
    },
    transaction,
  });
  const class_no = maxClassNo ? maxClassNo + 1 : 1;

  // ── Create enrollment ──────────────────────────────────────────────────────
  const created = await Enrollment.create({
    campus_id:      campusIdInt,
    session_id:     sessionIdInt,
    class_group_id: classGroupIdInt,
    student_id:     studentIdInt,
    section_id:     resolvedSectionId,
    class_no,
    status: 'active',
  }, { transaction });

  if (transaction) return;
  return getEnrollmentById(created.id);
};

// ── Delete ─────────────────────────────────────────────────────────────────────

const deleteEnrollment = async (enrollmentId) => {
  const enrollment = await getEnrollmentById(enrollmentId);
  await enrollment.destroy();
};

// ── Search eligible students ───────────────────────────────────────────────────

const searchEligibleStudents = async ({ sessionId, q }) => {
  const session = await AcademicSession.findByPk(parseInt(sessionId));
  if (!session) throw new ApiError(404, 'Academic session not found');

  const studentWhere = {};
  if (q) {
    studentWhere[Op.or] = [
      { full_name: { [Op.like]: `%${q}%` } },
      { gr_no: { [Op.like]: `%${q}%` } },
    ];
  }

  const students = await Student.findAll({
    where: studentWhere,
    attributes: ['id', 'full_name', 'gr_no'],
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        required: false,
        where: {
          session_id: parseInt(sessionId),
          status: 'active',
        },
        attributes: ['id'],
      },
    ],
    limit: 15,
    order: [['full_name', 'ASC']],
  });

  return students.map(s => ({
    id: s.id,
    full_name: s.full_name,
    gr_no: s.gr_no,
    already_enrolled: s.enrollments.length > 0,
  }));
};

module.exports = { listEnrollments, getEnrollmentById, createEnrollment, deleteEnrollment, searchEligibleStudents };

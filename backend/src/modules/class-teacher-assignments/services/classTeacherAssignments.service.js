const { Op } = require('sequelize');
const {
  ClassTeacherAssignment, ClassGroup, Section, Staff, StaffPosting,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── List (class-centric, grouped) ───────────────────────────────────────────────

const listAssignments = async ({ campusId, sessionId }) => {
  const campusIdInt  = parseInt(campusId);
  const sessionIdInt = parseInt(sessionId);

  const classGroups = await ClassGroup.findAll({
    where: { campus_id: campusIdInt, session_id: sessionIdInt },
    include: [
      {
        model: Section,
        as: 'sections',
        required: false,
        include: [
          {
            model: ClassTeacherAssignment,
            as: 'classTeacherAssignments',
            required: false,
            include: [
              { model: Staff, as: 'staff', attributes: ['id', 'full_name'] },
            ],
          },
        ],
      },
    ],
    order: [['level', 'ASC']],
  });

  return classGroups.map((classGroup) => {
    const namedSections = (classGroup.sections || []).filter((section) => section.name !== null);
    const nullSection    = (classGroup.sections || []).find((section) => section.name === null);

    const sections = namedSections.length > 0
      ? namedSections.map((section) => ({
        sectionId: section.id,
        sectionName: section.name,
        assignments: (section.classTeacherAssignments || []).map((assignment) => ({
          id: assignment.id,
          staffId: assignment.staff_id,
          staffName: assignment.staff?.full_name,
        })),
      }))
      : [
        {
          sectionId: null,
          sectionName: null,
          assignments: (nullSection?.classTeacherAssignments || []).map((assignment) => ({
            id: assignment.id,
            staffId: assignment.staff_id,
            staffName: assignment.staff?.full_name,
          })),
        },
      ];

    return {
      classGroupId: classGroup.id,
      className: classGroup.name,
      level: classGroup.level,
      academicLevel: classGroup.academic_level,
      sections,
    };
  });
};

// ── Add ──────────────────────────────────────────────────────────────────────────

const addAssignment = async ({ campusId, sessionId, sectionId, classGroupId, staffId }) => {
  const campusIdInt  = parseInt(campusId);
  const sessionIdInt = parseInt(sessionId);
  const staffIdInt   = parseInt(staffId);

  // ── Resolve section ────────────────────────────────────────────────────────
  let section;

  if (sectionId !== undefined && sectionId !== null) {
    section = await Section.findOne({
      where: { id: parseInt(sectionId) },
      include: [{
        model: ClassGroup,
        as: 'classGroup',
        where: { campus_id: campusIdInt, session_id: sessionIdInt },
      }],
    });
  } else {
    section = await Section.findOne({
      where: { class_group_id: parseInt(classGroupId), name: null },
      include: [{
        model: ClassGroup,
        as: 'classGroup',
        where: { campus_id: campusIdInt, session_id: sessionIdInt },
      }],
    });
  }
  if (!section) throw new ApiError(404, 'Section not found for this campus and session');

  // ── Validate staff posting ────────────────────────────────────────────────
  const posting = await StaffPosting.findOne({
    where: { campus_id: campusIdInt, staff_id: staffIdInt, is_active: 1 },
  });
  if (!posting) throw new ApiError(404, 'Staff member does not have an active posting at this campus');

  // ── Check duplicate ────────────────────────────────────────────────────────
  const existing = await ClassTeacherAssignment.findOne({
    where: {
      campus_id: campusIdInt,
      session_id: sessionIdInt,
      section_id: section.id,
      staff_id: staffIdInt,
    },
  });
  if (existing) throw new ApiError(409, 'This staff member is already assigned to this section');

  const created = await ClassTeacherAssignment.create({
    campus_id: campusIdInt,
    session_id: sessionIdInt,
    section_id: section.id,
    staff_id: staffIdInt,
  });

  return ClassTeacherAssignment.findByPk(created.id, {
    include: [{ model: Staff, as: 'staff', attributes: ['id', 'full_name'] }],
  });
};

// ── Remove ─────────────────────────────────────────────────────────────────────

const removeAssignment = async ({ campusId, assignmentId }) => {
  const assignment = await ClassTeacherAssignment.findOne({
    where: { id: parseInt(assignmentId), campus_id: parseInt(campusId) },
  });
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  await assignment.destroy();
};

// ── Search staff posted at this campus (for the assignment picker) ─────────────

const searchCampusStaff = async ({ campusId, search }) => {
  const campusIdInt = parseInt(campusId);

  const staffWhere = {};
  if (search) {
    staffWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { cnic:      { [Op.like]: `%${search}%` } },
    ];
  }

  const results = await Staff.findAll({
    where: staffWhere,
    attributes: ['id', 'full_name', 'cnic'],
    include: [{
      model: StaffPosting,
      as: 'postings',
      where: { campus_id: campusIdInt, is_active: 1 },
      attributes: [],
      required: true,
    }],
    order: [['full_name', 'ASC']],
    limit: 15,
  });

  return results;
};

module.exports = { listAssignments, addAssignment, removeAssignment, searchCampusStaff };

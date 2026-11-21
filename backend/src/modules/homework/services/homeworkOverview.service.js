const { Op } = require('sequelize');
const { sequelize, Homework, HomeworkSubmission, Subject, Staff, ClassGroup, Section, TimetableSlot, User } = require('../../../models');

const OVERVIEW_LIMIT = 500;

const day = (value) => String(value).slice(0, 10);

// ── Live assignments in a campus + session ──────────────────────────────────
// Same date-range rule as the teacher page: [assignedFrom, assignedTo] is an inclusive range on
// the ASSIGNED date and either end may be empty (open). Soft-deleted rows are excluded by the
// paranoid model. Optional class / section / subject / teacher filters.
const listHomeworkOverview = async ({
  campusId, sessionId, assignedFrom, assignedTo, classGroupId, sectionId, subjectId, staffId,
}) => {
  const where = { campus_id: campusId, session_id: sessionId };
  if (assignedFrom || assignedTo) {
    where.assigned_date = {};
    if (assignedFrom) where.assigned_date[Op.gte] = day(assignedFrom);
    if (assignedTo)   where.assigned_date[Op.lte] = day(assignedTo);
  }
  if (classGroupId) where.class_group_id = classGroupId;
  if (sectionId)    where.section_id = sectionId;
  if (subjectId)    where.subject_id = subjectId;
  if (staffId)      where.staff_id = staffId;

  const { count, rows } = await Homework.findAndCountAll({
    where,
    include: [
      { model: Subject,    as: 'subject',    attributes: ['id', 'name'] },
      { model: Staff,      as: 'postedBy',   attributes: ['id', 'full_name'] },
      { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
      { model: Section,    as: 'section',    attributes: ['id', 'name'] },
    ],
    order: [['assigned_date', 'DESC'], ['due_date', 'DESC'], ['created_at', 'DESC']],
    limit: OVERVIEW_LIMIT,
  });

  return { data: rows, total: count, truncated: count > OVERVIEW_LIMIT };
};

// ── "Recently deleted": soft-deleted assignments in a campus + session ──────
// Newest deletion first, with who deleted it and how many student submissions it has
// (the permanent-delete warning needs that).
const listDeletedHomework = async ({ campusId, sessionId }) => {
  const rows = await Homework.findAll({
    where: { campus_id: campusId, session_id: sessionId, deleted_at: { [Op.ne]: null } },
    paranoid: false,
    include: [
      { model: Subject,    as: 'subject',    attributes: ['id', 'name'] },
      { model: Staff,      as: 'postedBy',   attributes: ['id', 'full_name'] },
      { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
      { model: Section,    as: 'section',    attributes: ['id', 'name'] },
      { model: User,       as: 'deletedBy',  attributes: ['id', 'username', 'first_name', 'last_name'] },
    ],
    order: [['deleted_at', 'DESC'], ['id', 'DESC']],
    limit: OVERVIEW_LIMIT,
  });

  const ids = rows.map((r) => r.id);
  const counts = ids.length
    ? await HomeworkSubmission.findAll({
        where: { homework_id: { [Op.in]: ids } },
        attributes: ['homework_id', [sequelize.fn('COUNT', sequelize.col('id')), 'n']],
        group: ['homework_id'],
        raw: true,
      })
    : [];
  const byId = new Map(counts.map((c) => [c.homework_id, Number(c.n)]));

  return rows.map((r) => ({ ...r.toJSON(), submissionCount: byId.get(r.id) ?? 0 }));
};

// ── Who teaches what, where: one row per (class, section, subject, teacher), ──
// derived from the timetable. The frontend uses it for the group lists and to
// build the boxes on each report sheet.
const getHomeworkStructure = async ({ campusId, sessionId }) => {
  const slots = await TimetableSlot.findAll({
    include: [
      {
        model: ClassGroup,
        as: 'classGroup',
        where: { campus_id: campusId, session_id: sessionId },
        attributes: ['id', 'name', 'level'],
      },
      { model: Section, as: 'section', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject1', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject2', attributes: ['id', 'name'] },
      { model: Staff,   as: 'staff1',   attributes: ['id', 'full_name'] },
      { model: Staff,   as: 'staff2',   attributes: ['id', 'full_name'] },
    ],
  });

  const seen = new Map();
  const add = (slot, subject, staff) => {
    if (!subject) return;
    const key = `${slot.classGroup.id}-${slot.section.id}-${subject.id}-${staff?.id ?? 0}`;
    if (seen.has(key)) return;
    seen.set(key, {
      classGroupId: slot.classGroup.id,
      className: slot.classGroup.name,
      level: slot.classGroup.level,
      sectionId: slot.section.id,
      sectionName: slot.section.name,
      subjectId: subject.id,
      subjectName: subject.name,
      staffId: staff?.id ?? null,
      staffName: staff?.full_name ?? null,
    });
  };

  for (const slot of slots) {
    add(slot, slot.subject1, slot.staff1);
    add(slot, slot.subject2, slot.staff2);
  }

  return [...seen.values()];
};

module.exports = { listHomeworkOverview, listDeletedHomework, getHomeworkStructure };
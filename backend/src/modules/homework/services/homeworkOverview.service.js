const { Op } = require('sequelize');
const { Homework, Subject, Staff, ClassGroup, Section, TimetableSlot } = require('../../../models');

const OVERVIEW_LIMIT = 500;

// ── All assignments in a campus + session, optionally within a due-date range ──
const listHomeworkOverview = async ({ campusId, sessionId, dueFrom, dueTo }) => {
  const where = { campus_id: campusId, session_id: sessionId };
  if (dueFrom && dueTo) where.due_date = { [Op.between]: [dueFrom, dueTo] };
  else if (dueFrom)     where.due_date = { [Op.gte]: dueFrom };
  else if (dueTo)       where.due_date = { [Op.lte]: dueTo };

  const { count, rows } = await Homework.findAndCountAll({
    where,
    include: [
      { model: Subject,    as: 'subject',    attributes: ['id', 'name'] },
      { model: Staff,      as: 'postedBy',   attributes: ['id', 'full_name'] },
      { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
      { model: Section,    as: 'section',    attributes: ['id', 'name'] },
    ],
    order: [['due_date', 'DESC'], ['created_at', 'DESC']],
    limit: OVERVIEW_LIMIT,
  });

  return { data: rows, total: count, truncated: count > OVERVIEW_LIMIT };
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

module.exports = { listHomeworkOverview, getHomeworkStructure };
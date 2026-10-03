const { Op } = require('sequelize');
const { Staff, TimetableSlot, ClassGroup, Section, Subject, AcademicSession } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const getMyStaffRecord = async (userId) => {
  const staff = await Staff.findOne({ where: { user_id: userId } });
  if (!staff) throw new ApiError(403, 'No staff record is linked to this account');
  return staff;
};

// ── List distinct classes/sections this teacher teaches, derived from the ─────
// timetable. Each class now carries its subjects as {id, name} pairs (not just
// names), so the frontend can use them directly for subject-scoped actions
// like posting homework, without a second lookup.
const listMyTeachingClasses = async (userId, campusId) => {
  const staff = await getMyStaffRecord(userId);

  const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
  if (!activeSession) throw new ApiError(404, 'No active academic session is configured');

  const slots = await TimetableSlot.findAll({
    where: {
      [Op.or]: [{ staff_id_1: staff.id }, { staff_id_2: staff.id }],
    },
    include: [
      {
        model: ClassGroup,
        as: 'classGroup',
        where: { campus_id: campusId, session_id: activeSession.id },
        attributes: ['id', 'name', 'level', 'academic_level'],
      },
      { model: Section, as: 'section', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject1', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject2', attributes: ['id', 'name'] },
    ],
  });

  const byKey = new Map();
  for (const slot of slots) {
    const key = `${slot.classGroup.id}-${slot.section.id}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        classGroupId: slot.classGroup.id,
        className: slot.classGroup.name,
        level: slot.classGroup.level,
        academicLevel: slot.classGroup.academic_level,
        sectionId: slot.section.id,
        sectionName: slot.section.name,
        subjectsById: new Map(), // id -> name, dedupes correctly unlike a Set of names
      });
    }
    const entry = byKey.get(key);
    if (slot.staff_id_1 === staff.id && slot.subject1) entry.subjectsById.set(slot.subject1.id, slot.subject1.name);
    if (slot.staff_id_2 === staff.id && slot.subject2) entry.subjectsById.set(slot.subject2.id, slot.subject2.name);
  }

  return [...byKey.values()]
    .map((entry) => ({
      classGroupId: entry.classGroupId,
      className: entry.className,
      level: entry.level,
      academicLevel: entry.academicLevel,
      sectionId: entry.sectionId,
      sectionName: entry.sectionName,
      subjects: [...entry.subjectsById.entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || (a.sectionName ?? '').localeCompare(b.sectionName ?? ''));
};

module.exports = { getMyStaffRecord, listMyTeachingClasses };
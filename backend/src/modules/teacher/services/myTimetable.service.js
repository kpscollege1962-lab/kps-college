const { Op } = require('sequelize');
const {
  TimetableSlot, TimetablePeriod, TimetablePeriodTiming,
  ClassGroup, Section, Subject, AcademicSession,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { getMyStaffRecord } = require('../utils/myStaff');
const { subjectsForTeacher } = require('../utils/slotSubjects');

const listMyTimetable = async (userId, campusId) => {
  const staff = await getMyStaffRecord(userId);

  const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
  if (!activeSession) throw new ApiError(404, 'No active academic session is configured');

  const slots = await TimetableSlot.findAll({
    where: { [Op.or]: [{ staff_id_1: staff.id }, { staff_id_2: staff.id }] },
    include: [
      {
        model: TimetablePeriod, as: 'period',
        required: true,
        where: { campus_id: campusId },
        include: [{ model: TimetablePeriodTiming, as: 'timings' }],
      },
      {
        model: ClassGroup, as: 'classGroup',
        required: true,
        where: { campus_id: campusId, session_id: activeSession.id },
        attributes: ['id', 'name', 'level'],
      },
      { model: Section, as: 'section', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject1', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject2', attributes: ['id', 'name'] },
    ],
  });

  return slots
    .map((slot) => ({
      slotId:       slot.id,
      periodId:     slot.period.id,
      periodNumber: slot.period.period_number,
      classGroupId: slot.classGroup.id,
      className:    slot.classGroup.name,
      level:        slot.classGroup.level,
      sectionId:    slot.section?.id ?? null,
      sectionName:  slot.section?.name ?? null,
      subjects:     subjectsForTeacher(slot, staff.id),
      label:        slot.label ?? null,
      timings:      (slot.period.timings ?? []).map((t) => t.toJSON()),
    }))
    .sort((a, b) =>
      a.periodNumber - b.periodNumber ||
      (a.level ?? 0) - (b.level ?? 0) ||
      String(a.sectionName ?? '').localeCompare(String(b.sectionName ?? ''))
    );
};

module.exports = { listMyTimetable };
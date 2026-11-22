const { Op } = require('sequelize');
const {
  TimetableSlot, TimetablePeriod, TimetablePeriodTiming,
  ClassGroup, Section, Subject, AcademicSession,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { getMyStaffRecord } = require('../utils/myStaff');
const { subjectsForTeacher } = require('../utils/slotSubjects');
const { issuedCoverFor, issuedCoveredFrom } = require('../../rota/services/rotaEffects.service');
const { localToday } = require('../../rota/utils/localDate');

// The teacher's timetable for `date` (default: today): their regular periods, plus the ISSUED
// rota for that day: periods they take for an absent teacher (rotaFor) and their own periods
// someone else takes because they are absent (coveredBy). The regular timetable never changes.
const listMyTimetable = async (userId, campusId, { date = localToday() } = {}) => {
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

  const [cover, covered] = await Promise.all([
    issuedCoverFor({ staffId: staff.id, date, campusId }),
    issuedCoveredFrom({ staffId: staff.id, date, campusId }),
  ]);
  const coveredBy = (slot) => {
    const hit = covered.find(({ entry }) =>
      entry.period_id === slot.period.id && entry.class_group_id === slot.classGroup.id && entry.section_id === slot.section?.id);
    if (!hit) return null;
    return { staffId: hit.entry.substitute_staff_id, staffName: hit.entry.substituteStaff?.full_name ?? null };
  };

  const rotaEntries = cover
    .filter(({ entry }) => entry.classGroup?.session_id === activeSession.id && !entry.period?.is_assembly)
    .map(({ entry, slot, subjects }) => ({
      slotId:       `rota-${entry.id}`,
      periodId:     entry.period.id,
      periodNumber: entry.period.period_number,
      isAssembly:   false,
      classGroupId: entry.classGroup.id,
      className:    entry.classGroup.name,
      level:        entry.classGroup.level,
      sectionId:    entry.section?.id ?? null,
      sectionName:  entry.section?.name ?? null,
      subjects,
      label:        slot?.label ?? null,
      timings:      (entry.period.timings ?? []).map((t) => t.toJSON()),
      rotaFor:      { staffId: entry.absent_staff_id, staffName: entry.absentStaff?.full_name ?? null, date },
      coveredBy:    null,
    }));

  return [...slots
    .map((slot) => ({
      slotId:       slot.id,
      periodId:     slot.period.id,
      periodNumber: slot.period.period_number,
      isAssembly:   Boolean(slot.period.is_assembly),
      classGroupId: slot.classGroup.id,
      className:    slot.classGroup.name,
      level:        slot.classGroup.level,
      sectionId:    slot.section?.id ?? null,
      sectionName:  slot.section?.name ?? null,
      subjects:     subjectsForTeacher(slot, staff.id),
      label:        slot.label ?? null,
      timings:      (slot.period.timings ?? []).map((t) => t.toJSON()),
      rotaFor:      null,
      coveredBy:    coveredBy(slot),
    })), ...rotaEntries]
    .sort((a, b) =>
      a.periodNumber - b.periodNumber ||
      (a.level ?? 0) - (b.level ?? 0) ||
      String(a.sectionName ?? '').localeCompare(String(b.sectionName ?? ''))
    );
};

module.exports = { listMyTimetable };
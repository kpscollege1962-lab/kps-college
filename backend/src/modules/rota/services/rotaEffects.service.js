const {
  RotaDay, RotaEntry, TimetablePeriod, TimetablePeriodTiming, TimetableSlot,
  ClassGroup, Section, Staff, Subject,
} = require('../../../models');
const { subjectsForTeacher } = require('../../teacher/utils/slotSubjects');

// The ISSUED rota for one date, as the rest of the app sees it (Manage classes, posting
// assignments, form master, attendance). Drafts are invisible here. A rota only ever applies
// to its own date, so the next day the normal timetable is back with nothing to undo.
//
// Each entry comes with `subjects`: the subjects the absent teacher teaches in that slot
// (what the substitute covers), and `slot`: the timetable slot itself.

const entryIncludes = (date, campusId) => [
  {
    model: RotaDay, as: 'rotaDay', required: true, attributes: ['id', 'campus_id', 'rota_date', 'status'],
    where: { rota_date: date, status: 'issued', ...(campusId ? { campus_id: campusId } : {}) },
  },
  {
    model: TimetablePeriod, as: 'period', attributes: ['id', 'period_number', 'is_assembly', 'campus_id'],
    include: [{ model: TimetablePeriodTiming, as: 'timings' }],
  },
  { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level', 'academic_level', 'session_id', 'campus_id'] },
  { model: Section, as: 'section', attributes: ['id', 'name'] },
  { model: Staff, as: 'absentStaff', attributes: ['id', 'full_name', 'name_initials'] },
  { model: Staff, as: 'substituteStaff', attributes: ['id', 'full_name', 'name_initials'] },
];

const withSubjects = async (entries) => {
  if (!entries.length) return [];
  const slots = await TimetableSlot.findAll({
    where: {
      period_id: [...new Set(entries.map((e) => e.period_id))],
      class_group_id: [...new Set(entries.map((e) => e.class_group_id))],
    },
    include: [
      { model: Subject, as: 'subject1', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject2', attributes: ['id', 'name'] },
    ],
  });
  const slotAt = (e) => slots.find((s) =>
    s.period_id === e.period_id && s.class_group_id === e.class_group_id && s.section_id === e.section_id);
  return entries.map((e) => {
    const slot = slotAt(e) ?? null;
    return { entry: e, slot, subjects: slot ? subjectsForTeacher(slot, e.absent_staff_id) : [] };
  });
};

// Rota periods a teacher TAKES on `date` (they are the substitute).
const issuedCoverFor = async ({ staffId, date, campusId = null }) =>
  withSubjects(await RotaEntry.findAll({
    where: { substitute_staff_id: staffId },
    include: entryIncludes(date, campusId),
  }));

// Periods of a teacher that someone else takes on `date` (they are the absent teacher).
const issuedCoveredFrom = async ({ staffId, date, campusId = null }) =>
  withSubjects(await RotaEntry.findAll({
    where: { absent_staff_id: staffId },
    include: entryIncludes(date, campusId),
  }));

// Is `staffId` the substitute for this section's FIRST teaching period on `date`?
// (That teacher may mark the section's attendance and acts as form master that day.)
const coversFirstPeriodOf = async ({ staffId, sectionId, date }) => {
  const covers = await issuedCoverFor({ staffId, date });
  for (const { entry } of covers) {
    if (entry.section_id !== sectionId) continue;
    const first = await TimetablePeriod.min('period_number', {
      where: { campus_id: entry.period.campus_id, is_assembly: false },
    });
    if (entry.period.period_number === first) return true;
  }
  return false;
};

module.exports = { issuedCoverFor, issuedCoveredFrom, coversFirstPeriodOf };

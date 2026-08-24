const {
  TimetablePeriod, TimetablePeriodTiming, TimetableSlot,
  ClassGroup, Section, Subject, Staff,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const slotIncludes = [
  { model: Subject, as: 'subject1', attributes: ['id', 'name', 'name_initials'] },
  { model: Subject, as: 'subject2', attributes: ['id', 'name', 'name_initials'] },
  { model: Staff,   as: 'staff1',   attributes: ['id', 'full_name', 'name_initials'] },
  { model: Staff,   as: 'staff2',   attributes: ['id', 'full_name', 'name_initials'] },
];

// ── Class-wise preview ───────────────────────────────────────────────────────────

const getClassWisePreview = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable preview');
  }

  const periods = await TimetablePeriod.findAll({
    where: { campus_id: campusId },
    order: [['period_number', 'ASC']],
    include: [
      { model: TimetablePeriodTiming, as: 'timings' },
      { model: TimetableSlot, as: 'slots', include: slotIncludes },
    ],
  });

  const classGroups = await ClassGroup.findAll({
    where: { campus_id: campusId, session_id: sessionId },
    attributes: ['id', 'name', 'level'],
    include: [
      { model: Section, as: 'sections', attributes: ['id', 'name'] },
    ],
    order: [['level', 'ASC'], ['name', 'ASC']],
  });

  const rows = [];
  for (const cg of classGroups) {
    for (const section of (cg.sections ?? [])) {
      rows.push({
        classGroupId:    cg.id,
        sectionId:       section.id,
        classGroupName:  cg.name,
        classGroupLevel: cg.level,
        sectionName:     section.name ?? null,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.classGroupLevel !== b.classGroupLevel) {
      return (a.classGroupLevel ?? 0) - (b.classGroupLevel ?? 0);
    }
    if (a.sectionName === null && b.sectionName !== null) return -1;
    if (a.sectionName !== null && b.sectionName === null) return 1;
    return (a.sectionName ?? '').localeCompare(b.sectionName ?? '');
  });

  return { periods, rows };
};

// ── Staff-wise preview ───────────────────────────────────────────────────────────

const getStaffWisePreview = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable preview');
  }

  // A fresh array per call — see the comment on slotIncludeForSubject() below for why
  // the same include array instance cannot be shared across sibling includes.
  const nestedSlotIncludes = () => [
    {
      model: TimetablePeriod, as: 'period',
      required: true,
      where: { campus_id: campusId },
      attributes: ['id', 'period_number'],
    },
    {
      model: ClassGroup, as: 'classGroup',
      required: true,
      where: { session_id: sessionId },
      attributes: ['id', 'name'],
    },
    { model: Section, as: 'section', attributes: ['id', 'name'] },
    { model: Subject, as: 'subject1', attributes: ['id', 'name', 'name_initials'] },
    { model: Subject, as: 'subject2', attributes: ['id', 'name', 'name_initials'] },
  ];

  const staffList = await Staff.findAll({
    attributes: ['id', 'full_name', 'name_initials'],
    include: [
      {
        model: TimetableSlot,
        as: 'primaryTimetableSlots',
        required: false,
        attributes: ['id', 'break_position'],
        include: nestedSlotIncludes(),
      },
      {
        model: TimetableSlot,
        as: 'secondaryTimetableSlots',
        required: false,
        attributes: ['id', 'break_position'],
        include: nestedSlotIncludes(),
      },
    ],
    order: [['full_name', 'ASC']],
  });

  return staffList
    .map((staff) => {
      // Merge primary/secondary slot lists, dedupe by slot id — a staff member who
      // fills both roles for the same slot gets one entry with both subjects tagged.
      const bySlotId = new Map();
      const upsertEntry = (slot, role) => {
        const existing = bySlotId.get(slot.id);
        if (existing) {
          if (role === 'primary')   existing.subject1 = slot.subject1 ?? null;
          else                      existing.subject2 = slot.subject2 ?? null;
          return;
        }
        bySlotId.set(slot.id, {
          periodNumber:   slot.period.period_number,
          classGroupName: slot.classGroup?.name ?? null,
          sectionName:    slot.section?.name ?? null,
          subject1:       role === 'primary'   ? (slot.subject1 ?? null) : null,
          subject2:       role === 'secondary' ? (slot.subject2 ?? null) : null,
          breakPosition:  slot.break_position ?? null,
        });
      };
      for (const slot of (staff.primaryTimetableSlots ?? []))   upsertEntry(slot, 'primary');
      for (const slot of (staff.secondaryTimetableSlots ?? [])) upsertEntry(slot, 'secondary');

      return {
        id:            staff.id,
        full_name:     staff.full_name,
        name_initials: staff.name_initials,
        slots: [...bySlotId.values()].sort((a, b) => a.periodNumber - b.periodNumber),
      };
    })
    .filter((staff) => staff.slots.length > 0);
};

// ── Subject-wise preview ─────────────────────────────────────────────────────────

const getSubjectWisePreview = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable preview');
  }

  // A fresh array of include objects per call — Sequelize mutates include
  // objects in place (e.g. to set join aliases), so the same array instance
  // cannot be reused across two sibling includes (primarySlots/secondarySlots)
  // without one clobbering the other's alias.
  const slotIncludeForSubject = () => [
    {
      model: TimetablePeriod, as: 'period',
      required: true,
      where: { campus_id: campusId },
      attributes: ['id', 'period_number'],
    },
    {
      model: ClassGroup, as: 'classGroup',
      required: true,
      where: { session_id: sessionId },
      attributes: ['id', 'name'],
    },
    { model: Section, as: 'section', attributes: ['id', 'name'] },
    { model: Staff,   as: 'staff1',  attributes: ['id', 'full_name', 'name_initials'] },
    { model: Staff,   as: 'staff2',  attributes: ['id', 'full_name', 'name_initials'] },
  ];

  const subjects = await Subject.findAll({
    attributes: ['id', 'name', 'name_initials', 'category'],
    include: [
      {
        model: TimetableSlot, as: 'primarySlots',
        attributes: ['id'],
        include: slotIncludeForSubject(),
      },
      {
        model: TimetableSlot, as: 'secondarySlots',
        attributes: ['id'],
        include: slotIncludeForSubject(),
      },
    ],
    order: [['name', 'ASC']],
  });

  const mapSlot = (slot, staffKey) => ({
    periodNumber:   slot.period.period_number,
    classGroupName: slot.classGroup?.name ?? null,
    sectionName:    slot.section?.name ?? null,
    staff:          slot[staffKey] ?? null,
  });

  return subjects
    .map((subject) => {
      const slots = [
        ...(subject.primarySlots ?? []).map((slot) => mapSlot(slot, 'staff1')),
        ...(subject.secondarySlots ?? []).map((slot) => mapSlot(slot, 'staff2')),
      ].sort((a, b) => a.periodNumber - b.periodNumber);
      return {
        id:            subject.id,
        name:          subject.name,
        name_initials: subject.name_initials,
        category:      subject.category,
        slots,
      };
    })
    .filter((subject) => subject.slots.length > 0);
};

module.exports = { getClassWisePreview, getStaffWisePreview, getSubjectWisePreview };

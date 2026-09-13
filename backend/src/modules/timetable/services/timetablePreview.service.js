const { Op } = require('sequelize');
const {
  TimetablePeriod, TimetablePeriodTiming, TimetableSlot,
  ClassGroup, Section, Subject, Staff, StaffPosting,
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
// Rewritten to query TimetableSlot directly rather than through Staff's
// primaryTimetableSlots/secondaryTimetableSlots associations. That matters for
// "alternating subject" slots — one physical slot with staff_id_1 === staff_id_2
// (the same teacher covering two subjects on the same class/period, alternating
// week to week) — because processing slot-first, and setting subject1/subject2
// independently on the SAME merged entry, guarantees both land together
// regardless of how Sequelize's two separate hasMany associations behave when
// they both resolve to the identical staff+slot pair.

const getStaffWisePreview = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable preview');
  }

  const staffList = await Staff.findAll({
    attributes: ['id', 'full_name', 'name_initials'],
    include: [
      // Purely for seniority sorting below — not exposed in the response.
      {
        model: StaffPosting, as: 'postings',
        required: false,
        where: { campus_id: campusId },
        attributes: ['joining_date'],
      },
    ],
    order: [['full_name', 'ASC']], // stable base order; seniority re-sort applied below
  });

  const slots = await TimetableSlot.findAll({
    where: {
      [Op.or]: [
        { staff_id_1: { [Op.ne]: null } },
        { staff_id_2: { [Op.ne]: null } },
      ],
    },
    attributes: ['id', 'label', 'break_position', 'staff_id_1', 'staff_id_2'],
    include: [
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
    ],
  });

  // staffId -> Map(slotId -> merged entry)
  const bySlotByStaff = new Map();
  const getEntryMap = (staffId) => {
    if (!bySlotByStaff.has(staffId)) bySlotByStaff.set(staffId, new Map());
    return bySlotByStaff.get(staffId);
  };

  for (const slot of slots) {
    const base = {
      periodNumber:   slot.period.period_number,
      classGroupName: slot.classGroup?.name ?? null,
      sectionName:    slot.section?.name ?? null,
      label:          slot.label ?? null,
      breakPosition:  slot.break_position ?? null,
    };

    if (slot.staff_id_1 != null) {
      const entryMap = getEntryMap(slot.staff_id_1);
      const existing = entryMap.get(slot.id);
      if (existing) existing.subject1 = slot.subject1 ?? null;
      else entryMap.set(slot.id, { ...base, subject1: slot.subject1 ?? null, subject2: null });
    }
    if (slot.staff_id_2 != null) {
      const entryMap = getEntryMap(slot.staff_id_2);
      const existing = entryMap.get(slot.id);
      if (existing) existing.subject2 = slot.subject2 ?? null;
      else entryMap.set(slot.id, { ...base, subject1: null, subject2: slot.subject2 ?? null });
    }
  }

  const withSlots = staffList.map((staff) => {
    const entryMap = bySlotByStaff.get(staff.id) ?? new Map();
    return {
      id:            staff.id,
      full_name:     staff.full_name,
      name_initials: staff.name_initials,
      _joiningDate:  staff.postings?.[0]?.joining_date ?? null,
      slots: [...entryMap.values()].sort((a, b) => a.periodNumber - b.periodNumber),
    };
  });
  // Note: staff with zero periods are now KEPT (not filtered out) — see the
  // "empty row" request: an admin should be able to see who has nothing
  // assigned, not just who does.

  // Seniority order: earliest joining_date first (most senior at the top).
  // Staff with no recorded joining_date sort last, then alphabetically among
  // themselves as a tiebreaker.
  withSlots.sort((a, b) => {
    if (a._joiningDate && b._joiningDate) return new Date(a._joiningDate) - new Date(b._joiningDate);
    if (a._joiningDate && !b._joiningDate) return -1;
    if (!a._joiningDate && b._joiningDate) return 1;
    return a.full_name.localeCompare(b.full_name);
  });

  return withSlots.map(({ _joiningDate, ...staff }) => staff);
};

// ── Subject-wise preview ─────────────────────────────────────────────────────────

const getSubjectWisePreview = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable preview');
  }

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
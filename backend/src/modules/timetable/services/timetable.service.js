const {
  TimetablePeriod, TimetablePeriodTiming, TimetableSlot,
  ClassGroup, Section, Staff, StaffPosting,
} = require('../../../models');
const { slotIncludes } = require('./slot.service');
const ApiError = require('../../../utils/ApiError');

// ── GET full campus timetable ──────────────────────────────────────────────────

const getCampusTimetable = async ({ campusId, sessionId }) => {
  if (!sessionId) {
    throw new ApiError(422, 'Session is required to view the timetable');
  }

  // ── 1. Fetch periods with timings and slots for this campus ─────────────────
  const periods = await TimetablePeriod.findAll({
    where: { campus_id: campusId },
    order: [['period_number', 'ASC']],
    include: [
      { model: TimetablePeriodTiming, as: 'timings' },
      {
        model: TimetableSlot, as: 'slots',
        include: [
          { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
          { model: Section,    as: 'section',    attributes: ['id', 'name'] },
          ...slotIncludes,
        ],
      },
    ],
  });

  // ── 2. Fetch all classes for this campus + session, with all sections ────────
  //       Null-named sections are intentionally included — they are valid slot
  //       coordinates for unsectioned classes and must appear as grid rows.
  const classGroups = await ClassGroup.findAll({
    where: { campus_id: campusId, session_id: sessionId },
    attributes: ['id', 'name', 'level'],
    include: [
      {
        model: Section,
        as: 'sections',
        attributes: ['id', 'name'],
        // No where clause — include ALL sections, named and null
      },
    ],
    order: [['level', 'ASC'], ['name', 'ASC']],
  });

  // ── 3. Build rows — one row per (classGroup, section) pair ──────────────────
  //       For unsectioned classes (single null section): one row, sectionName null.
  //       For sectioned classes: one row per named section.
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

  // ── 4. Sort: by classGroupLevel ASC, then sectionName ASC (null sorts first) ─
  rows.sort((a, b) => {
    if (a.classGroupLevel !== b.classGroupLevel) {
      return (a.classGroupLevel ?? 0) - (b.classGroupLevel ?? 0);
    }
    // null sectionName (unsectioned) sorts before named sections
    if (a.sectionName === null && b.sectionName !== null) return -1;
    if (a.sectionName !== null && b.sectionName === null) return 1;
    return (a.sectionName ?? '').localeCompare(b.sectionName ?? '');
  });

  return { periods, rows };
};

// ── GET class timetable ────────────────────────────────────────────────────────

const getClassTimetable = async ({ campusId, classGroupId, sectionId }) => {
  let resolvedSectionId = sectionId ? parseInt(sectionId) : null;

  // If no sectionId provided, find the null section for this class
  if (!resolvedSectionId) {
    const nullSection = await Section.findOne({
      where: { class_group_id: parseInt(classGroupId), name: null },
    });
    if (!nullSection) {
      // Class has named sections but no sectionId was provided
      throw new ApiError(422, 'This class has sections. Please provide a sectionId.');
    }
    resolvedSectionId = nullSection.id;
  }

  const periods = await TimetablePeriod.findAll({
    where: { campus_id: parseInt(campusId) },
    order: [['period_number', 'ASC']],
    include: [
      { model: TimetablePeriodTiming, as: 'timings' },
      {
        model: TimetableSlot, as: 'slots',
        where: { class_group_id: parseInt(classGroupId), section_id: resolvedSectionId },
        required: false,
        include: slotIncludes,
      },
    ],
  });
  return periods;
};

// ── GET staff posted at campus (for slot dropdowns / staff panel) ──────────────

const getTimetableStaff = async ({ campusId }) => {
  const staff = await Staff.findAll({
    attributes: ['id', 'full_name', 'name_initials'],
    include: [{
      model: StaffPosting,
      as: 'postings',
      where: { campus_id: campusId, is_active: 1, is_timetable_eligible: 1 },
      attributes: [],
    }],
    order: [['full_name', 'ASC']],
  });
  return staff;
};

module.exports = { getCampusTimetable, getClassTimetable, getTimetableStaff };

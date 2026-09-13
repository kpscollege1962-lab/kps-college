const { Op } = require('sequelize');
const { TimetableSlot, Subject, Staff, ClassGroup, Section, StaffPosting } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { findPeriodOrFail } = require('./period.service');

// ── Shared slot includes (exported — also used by timetable.service read queries) ─

const slotIncludes = [
  { model: Subject, as: 'subject1', attributes: ['id', 'name', 'name_initials'] },
  { model: Subject, as: 'subject2', attributes: ['id', 'name', 'name_initials'] },
  { model: Staff,   as: 'staff1',   attributes: ['id', 'full_name', 'name_initials'] },
  { model: Staff,   as: 'staff2',   attributes: ['id', 'full_name', 'name_initials'] },
];

// ── Concurrent-period exemption by slot label ──────────────────────────────────
// PT/DRILL periods are run by one staff member across several classes/sections
// at the same time by design, so they're exempt from the "staff can only be in
// one place per period" check — for whichever staff member is assigned, not
// just a specific person. Match is case-insensitive and trims whitespace.

const CONCURRENT_EXEMPT_LABELS = ['PT', 'DRILL'];

const isConcurrentExemptLabel = (label) =>
  !!label && CONCURRENT_EXEMPT_LABELS.includes(label.trim().toUpperCase());

// ── Staff period conflict check ────────────────────────────────────────────────
// A staff member can only appear in one slot per period (across all class groups/sections) —
// UNLESS both the slot being written and the conflicting slot are "alternate" slots
// (staff_id_1 AND staff_id_2 both populated on the row). An alternate slot splits its
// period's clock time in half between two teachers (e.g. a 40-minute period becomes two
// 20-minute halves), so each teacher assigned that way is only actually occupied for half
// the period — meaning the same teacher can legitimately be part of a second alternate
// slot elsewhere in that same period, covering the other half of their time. This
// exemption only applies when BOTH slots are alternate; a teacher who is the sole staff
// member on a slot (staff_id_2 null) still occupies the full period and stays blocked.

// excludePositions: [{ classGroupId, sectionId }, ...] — one or more positions to
// exclude from the conflict search. A swap excludes BOTH the source and destination
// positions when they share the same period, since the staff member's own pre-swap
// row may still physically occupy the other position until the transaction commits.
const checkStaffPeriodConflict = async ({ staffId, periodId, campusId, label, excludePositions, isAlternate }) => {
  if (isConcurrentExemptLabel(label)) return; // PT/DRILL — exempt regardless of staff

  const posting = await StaffPosting.findOne({
    where: { staff_id: staffId, campus_id: campusId },
  });
  if (posting?.allow_concurrent_periods) return; // exempt — no conflict check at all

  const conflict = await TimetableSlot.findOne({
    where: {
      [Op.or]:  [{ staff_id_1: staffId }, { staff_id_2: staffId }],
      period_id: periodId,
      [Op.and]: excludePositions.map(({ classGroupId, sectionId }) => ({
        [Op.not]: { class_group_id: classGroupId, section_id: sectionId },
      })),
    },
    include: [
      { model: ClassGroup, as: 'classGroup', attributes: ['name'] },
      { model: Section,    as: 'section',    attributes: ['name'] },
    ],
  });

  if (!conflict) return;

  // Alternate-class exemption — see comment above.
  const conflictIsAlternate = conflict.staff_id_1 != null && conflict.staff_id_2 != null;
  if (isAlternate && conflictIsAlternate) return;

  const where = conflict.classGroup
    ? ` (${conflict.classGroup.name}${conflict.section?.name ? ` ${conflict.section.name}` : ''})`
    : ''
  throw new ApiError(409, `This Staff is already assigned to period${where}`)
};

// ── Upsert slot ────────────────────────────────────────────────────────────────

const upsertSlot = async ({ campusId, classGroupId, sectionId, periodId, label, subjectId1, subjectId2, staffId1, staffId2, breakPosition }) => {
  await findPeriodOrFail({ periodId, campusId });

  // Resolve the label and staff fields this slot will actually carry after this
  // write — the incoming value if one was given, otherwise whatever the slot
  // already has — since both the exemption-by-label check and the
  // alternate-slot check must reflect the slot's real resulting content, not
  // just what happens to be in this particular request payload.
  const existingSlot = await TimetableSlot.findOne({
    where: { period_id: periodId, class_group_id: classGroupId, section_id: sectionId },
  });
  const effectiveLabel    = label     !== undefined ? label     : (existingSlot?.label      ?? null);
  const effectiveStaffId1 = staffId1  !== undefined ? staffId1  : (existingSlot?.staff_id_1  ?? null);
  const effectiveStaffId2 = staffId2  !== undefined ? staffId2  : (existingSlot?.staff_id_2  ?? null);
  const isAlternate = effectiveStaffId1 != null && effectiveStaffId2 != null;

  if (staffId1 != null) {
    await checkStaffPeriodConflict({
      staffId: staffId1, periodId, campusId, label: effectiveLabel, isAlternate,
      excludePositions: [{ classGroupId, sectionId }],
    });
  }
  if (staffId2 != null) {
    await checkStaffPeriodConflict({
      staffId: staffId2, periodId, campusId, label: effectiveLabel, isAlternate,
      excludePositions: [{ classGroupId, sectionId }],
    });
  }

  const [slot, created] = await TimetableSlot.findOrCreate({
    where:    { period_id: periodId, class_group_id: classGroupId, section_id: sectionId },
    defaults: {
      label,
      subject_id_1:   subjectId1,
      subject_id_2:   subjectId2,
      staff_id_1:     staffId1,
      staff_id_2:     staffId2,
      break_position: breakPosition,
    },
  });

  if (!created) {
    const updates = {};
    if (label         !== undefined) updates.label          = label;
    if (subjectId1    !== undefined) updates.subject_id_1   = subjectId1;
    if (subjectId2    !== undefined) updates.subject_id_2   = subjectId2;
    if (staffId1      !== undefined) updates.staff_id_1     = staffId1;
    if (staffId2      !== undefined) updates.staff_id_2     = staffId2;
    if (breakPosition !== undefined) updates.break_position  = breakPosition;
    await slot.update(updates);
  }

  return slot.reload({ include: slotIncludes });
};

// ── Clear slot ─────────────────────────────────────────────────────────────────

const clearSlot = async ({ campusId, classGroupId, sectionId, periodId }) => {
  await findPeriodOrFail({ periodId, campusId });

  const slot = await TimetableSlot.findOne({
    where: { period_id: periodId, class_group_id: classGroupId, section_id: sectionId },
  });
  if (!slot) throw new ApiError(404, 'Slot not found');

  await slot.destroy();
};

// ── Swap slots ─────────────────────────────────────────────────────────────────
// Swaps content (label, subject_id_1, subject_id_2, staff_id) between two slots,
// which may belong to different periods. break_position is NOT swapped — it stays
// with the slot's position (class/section), not its content, since it describes
// when that class takes their break, independent of what subject/staff is assigned.
// Atomic: either both slots update or neither does. Staff period-conflict checks run
// for both new placements — each checked against its OWN destination period — before
// any write commits.
const swapSlots = async ({
  campusId,
  slotA, // { periodId, classGroupId, sectionId }
  slotB, // { periodId, classGroupId, sectionId }
}) => {
  const { sequelize } = require('../../../models');
  await findPeriodOrFail({ periodId: slotA.periodId, campusId });
  await findPeriodOrFail({ periodId: slotB.periodId, campusId });
  if (
    slotA.periodId === slotB.periodId &&
    slotA.classGroupId === slotB.classGroupId &&
    slotA.sectionId === slotB.sectionId
  ) {
    throw new ApiError(422, 'Cannot swap a slot with itself');
  }
  const contentOf = (slot) => ({
    label:        slot?.label        ?? null,
    subject_id_1: slot?.subject_id_1 ?? null,
    subject_id_2: slot?.subject_id_2 ?? null,
    staff_id_1:   slot?.staff_id_1   ?? null,
    staff_id_2:   slot?.staff_id_2   ?? null,
  });
  const isEmptyContent = (content) =>
    content.label        === null &&
    content.subject_id_1 === null &&
    content.subject_id_2 === null &&
    content.staff_id_1   === null &&
    content.staff_id_2   === null;
  const isAlternateContent = (content) =>
    content.staff_id_1 != null && content.staff_id_2 != null;
  const result = await sequelize.transaction(async (t) => {
    const [recordA, recordB] = await Promise.all([
      TimetableSlot.findOne({
        where: { period_id: slotA.periodId, class_group_id: slotA.classGroupId, section_id: slotA.sectionId },
        transaction: t,
      }),
      TimetableSlot.findOne({
        where: { period_id: slotB.periodId, class_group_id: slotB.classGroupId, section_id: slotB.sectionId },
        transaction: t,
      }),
    ]);
    const contentA = contentOf(recordA);
    const contentB = contentOf(recordB);
    // Staff conflict checks — each staff member's NEW placement is checked against
    // its own DESTINATION period, not a shared one. B's staff moves into A's period;
    // A's staff moves into B's period. Each check uses the LABEL that's moving along
    // with that content, so a PT/DRILL slot swapped into a new period stays exempt —
    // and the ALTERNATE flag that's moving with it, so an alternate slot swapped into
    // a new period still allows the same-teacher-twice exemption there.
    // Exclude BOTH slot positions from each check. This matters specifically when
    // slotA.periodId === slotB.periodId — the staff member's own pre-swap row may still
    // be sitting at the *other* slot's position (not yet overwritten) when this check
    // runs, and that row must not be mistaken for a genuine conflict.
    const contentBIsAlternate = isAlternateContent(contentB);
    const contentAIsAlternate = isAlternateContent(contentA);
    if (contentB.staff_id_1 != null) {
      await checkStaffPeriodConflict({
        staffId: contentB.staff_id_1, periodId: slotA.periodId, campusId, label: contentB.label,
        isAlternate: contentBIsAlternate,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentB.staff_id_2 != null) {
      await checkStaffPeriodConflict({
        staffId: contentB.staff_id_2, periodId: slotA.periodId, campusId, label: contentB.label,
        isAlternate: contentBIsAlternate,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentA.staff_id_1 != null) {
      await checkStaffPeriodConflict({
        staffId: contentA.staff_id_1, periodId: slotB.periodId, campusId, label: contentA.label,
        isAlternate: contentAIsAlternate,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentA.staff_id_2 != null) {
      await checkStaffPeriodConflict({
        staffId: contentA.staff_id_2, periodId: slotB.periodId, campusId, label: contentA.label,
        isAlternate: contentAIsAlternate,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    // Write B's old content into A's slot (A's period), A's old content into B's
    // slot (B's period). break_position is deliberately omitted from both updates.
    const [finalA] = await TimetableSlot.upsert(
      { period_id: slotA.periodId, class_group_id: slotA.classGroupId, section_id: slotA.sectionId, ...contentB },
      { transaction: t, returning: true }
    );
    const [finalB] = await TimetableSlot.upsert(
      { period_id: slotB.periodId, class_group_id: slotB.classGroupId, section_id: slotB.sectionId, ...contentA },
      { transaction: t, returning: true }
    );

    // Hard delete any slot that ended up with all-null content.
    // This happens when an empty cell (no row) is one of the swap targets —
    // its null content gets written into the other position, producing an empty row.
    if (isEmptyContent(contentB)) {
      await TimetableSlot.destroy({
        where: {
          period_id:      slotA.periodId,
          class_group_id: slotA.classGroupId,
          section_id:     slotA.sectionId,
        },
        transaction: t,
      });
    }
    if (isEmptyContent(contentA)) {
      await TimetableSlot.destroy({
        where: {
          period_id:      slotB.periodId,
          class_group_id: slotB.classGroupId,
          section_id:     slotB.sectionId,
        },
        transaction: t,
      });
    }

    return { finalA, finalB, contentA, contentB };
  });
  const [reloadedA, reloadedB] = await Promise.all([
    isEmptyContent(result.contentB) ? null : result.finalA.reload({ include: slotIncludes }),
    isEmptyContent(result.contentA) ? null : result.finalB.reload({ include: slotIncludes }),
  ]);
  return { slotA: reloadedA, slotB: reloadedB };
};

module.exports = { slotIncludes, upsertSlot, clearSlot, swapSlots };
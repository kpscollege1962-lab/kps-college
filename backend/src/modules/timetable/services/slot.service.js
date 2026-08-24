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

// ── Staff period conflict check ────────────────────────────────────────────────
// A staff member can only appear in one slot per period (across all class groups/sections).

// excludePositions: [{ classGroupId, sectionId }, ...] — one or more positions to
// exclude from the conflict search. A swap excludes BOTH the source and destination
// positions when they share the same period, since the staff member's own pre-swap
// row may still physically occupy the other position until the transaction commits.
const checkStaffPeriodConflict = async ({ staffId, periodId, campusId, excludePositions }) => {
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

  if (conflict) {
    const where = conflict.classGroup
      ? ` (${conflict.classGroup.name}${conflict.section?.name ? ` ${conflict.section.name}` : ''})`
      : ''
    throw new ApiError(409, `This Staff is already assigned to period${where}`)
  }
};

// ── Upsert slot ────────────────────────────────────────────────────────────────

const upsertSlot = async ({ campusId, classGroupId, sectionId, periodId, label, subjectId1, subjectId2, staffId1, staffId2, breakPosition }) => {
  await findPeriodOrFail({ periodId, campusId });

  if (staffId1 != null) {
    await checkStaffPeriodConflict({
      staffId: staffId1, periodId, campusId,
      excludePositions: [{ classGroupId, sectionId }],
    });
  }
  if (staffId2 != null) {
    await checkStaffPeriodConflict({
      staffId: staffId2, periodId, campusId,
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
    // A's staff moves into B's period.
    // Exclude BOTH slot positions from each check. This matters specifically when
    // slotA.periodId === slotB.periodId — the staff member's own pre-swap row may still
    // be sitting at the *other* slot's position (not yet overwritten) when this check
    // runs, and that row must not be mistaken for a genuine conflict.
    if (contentB.staff_id_1 != null) {
      await checkStaffPeriodConflict({
        staffId: contentB.staff_id_1, periodId: slotA.periodId, campusId,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentB.staff_id_2 != null) {
      await checkStaffPeriodConflict({
        staffId: contentB.staff_id_2, periodId: slotA.periodId, campusId,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentA.staff_id_1 != null) {
      await checkStaffPeriodConflict({
        staffId: contentA.staff_id_1, periodId: slotB.periodId, campusId,
        excludePositions: [
          { classGroupId: slotA.classGroupId, sectionId: slotA.sectionId },
          { classGroupId: slotB.classGroupId, sectionId: slotB.sectionId },
        ],
      });
    }
    if (contentA.staff_id_2 != null) {
      await checkStaffPeriodConflict({
        staffId: contentA.staff_id_2, periodId: slotB.periodId, campusId,
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

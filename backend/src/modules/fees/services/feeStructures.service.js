const { FeeStructure, FeeHead, ClassGroup, Section } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Internal helper ────────────────────────────────────────────────────────────
const getFeeStructureById = async (feeStructureId, campusId) => {
  const structure = await FeeStructure.findOne({
    where: { id: feeStructureId, campus_id: campusId },
    include: [
      { model: FeeHead, as: 'feeHead' },
      { model: ClassGroup, as: 'classGroup' },
      { model: Section, as: 'section' },
    ],
  });
  if (!structure) throw new ApiError(404, 'Fee structure not found');
  return structure;
};

// ── List fee structures for a campus+session, optionally filtered by class ────
const listFeeStructures = async ({ campusId, sessionId, classGroupId, sectionId, page = 1, limit = 50 }) => {
  const where = { campus_id: campusId, session_id: sessionId };
  if (classGroupId) where.class_group_id = classGroupId;
  if (sectionId !== undefined) where.section_id = sectionId; // pass null explicitly to fetch class-level defaults only

  const offset = (page - 1) * limit;
  const { count, rows } = await FeeStructure.findAndCountAll({
    where,
    include: [
      { model: FeeHead, as: 'feeHead' },
      { model: ClassGroup, as: 'classGroup' },
      { model: Section, as: 'section' },
    ],
    order: [[{ model: ClassGroup, as: 'classGroup' }, 'level', 'ASC'], [{ model: FeeHead, as: 'feeHead' }, 'name', 'ASC']],
    limit,
    offset,
  });
  return { data: rows, total: count, page, limit };
};

// ── Create or update a fee structure (set-once-per-class/session pattern) ─────
// Upserts on the unique key (session_id, class_group_id, section_id, fee_head_id) —
// admin re-saving the same class/fee-head just updates amount/due_day in place.
const upsertFeeStructure = async ({ campusId, sessionId, classGroupId, sectionId, feeHeadId, amount, dueDay }) => {
  const classGroup = await ClassGroup.findOne({ where: { id: classGroupId, campus_id: campusId, session_id: sessionId } });
  if (!classGroup) throw new ApiError(404, 'Class not found for this campus and session');

  if (sectionId) {
    const section = await Section.findOne({ where: { id: sectionId, class_group_id: classGroupId } });
    if (!section) throw new ApiError(404, 'Section not found for this class');
  }

  const feeHead = await FeeHead.findOne({ where: { id: feeHeadId, campus_id: campusId } });
  if (!feeHead) throw new ApiError(404, 'Fee head not found for this campus');

  const existing = await FeeStructure.findOne({
    where: {
      session_id: sessionId,
      class_group_id: classGroupId,
      section_id: sectionId ?? null,
      fee_head_id: feeHeadId,
    },
  });

  if (existing) {
    await existing.update({ amount, due_day: dueDay });
    return getFeeStructureById(existing.id, campusId);
  }

  const created = await FeeStructure.create({
    campus_id: campusId,
    session_id: sessionId,
    class_group_id: classGroupId,
    section_id: sectionId ?? null,
    fee_head_id: feeHeadId,
    amount,
    due_day: dueDay,
  });
  return getFeeStructureById(created.id, campusId);
};

// ── Delete a fee structure ────────────────────────────────────────────────────────
const deleteFeeStructure = async (feeStructureId, campusId) => {
  const structure = await getFeeStructureById(feeStructureId, campusId);
  await structure.destroy();
};

module.exports = { listFeeStructures, getFeeStructureById, upsertFeeStructure, deleteFeeStructure };
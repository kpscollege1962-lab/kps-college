const { FeeHead, FeeStructure } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { upsertFeeStructure } = require('./feeStructures.service');
const { generateChallans } = require('./feeChallans.service');

// ── Fetch fee heads grouped by category, with any existing class-level ────────
// fee structure amount pre-filled (null if not yet set for this class/session)
const getClassFeeSetup = async ({ campusId, sessionId, classGroupId }) => {
  const feeHeads = await FeeHead.findAll({
    where: { campus_id: campusId, is_active: true },
    order: [['category', 'ASC'], ['name', 'ASC']],
  });

  const existingStructures = await FeeStructure.findAll({
    where: { campus_id: campusId, session_id: sessionId, class_group_id: classGroupId, section_id: null },
  });
  const byFeeHead = new Map(existingStructures.map((s) => [s.fee_head_id, s]));

  const grouped = { fees: [], facilities: [], fines: [] };
  for (const fh of feeHeads) {
    const existing = byFeeHead.get(fh.id);
    grouped[fh.category].push({
      feeHeadId: fh.id,
      name: fh.name,
      amount: existing ? parseFloat(existing.amount) : null,
      dueDay: existing ? existing.due_day : null,
    });
  }
  return grouped;
};

// ── Save class-level fee structure for the given items, then immediately ──────
// generate this month's challans for every active enrollment in the class.
// Items with no amount are skipped (that fee head isn't charged to this class).
const assignClassFees = async ({ campusId, sessionId, classGroupId, dueDay, items }) => {
  if (!items?.length) throw new ApiError(400, 'At least one fee head amount is required');

  for (const item of items) {
    await upsertFeeStructure({
      campusId,
      sessionId,
      classGroupId,
      sectionId: null,
      feeHeadId: item.feeHeadId,
      amount: item.amount,
      dueDay,
    });
  }

  const now = new Date();
  const challanResult = await generateChallans({
    campusId,
    sessionId,
    classGroupId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return { structuresSaved: items.length, challanResult };
};

module.exports = { getClassFeeSetup, assignClassFees };
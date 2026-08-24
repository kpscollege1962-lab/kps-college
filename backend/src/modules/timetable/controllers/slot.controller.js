const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { upsertSlot, clearSlot, swapSlots } = require('../services/slot.service');

// ── PUT /campuses/:campusId/timetable/periods/:periodId/classes/:classGroupId/sections/:sectionId/slot ──

const upsertSlotCtrl = async (req, res) => {
  const { campusId, classGroupId, sectionId, periodId } = matchedData(req, { locations: ['params'] });

  // Body fields are read from req.body rather than matchedData because express-validator
  // strips null values from optional-nullable fields before they reach matchedData.
  // That silently drops the caller's intent to clear a FK field (set it to null).
  // Validation has already run on these fields; we just need to parse them safely.
  const { label, subjectId1, subjectId2, staffId1, staffId2 } = req.body;

  // Converts: undefined → undefined (not sent, keep existing), null → null (clear),
  //           string/number → parsed int (set new value).
  const parseId = (v) => v === undefined ? undefined : v !== null ? parseInt(v, 10) : null;

  const slot = await upsertSlot({
    campusId:     parseInt(campusId),
    classGroupId: parseInt(classGroupId),
    sectionId:    parseInt(sectionId),
    periodId:     parseInt(periodId),
    label:        label || null,
    subjectId1:   parseId(subjectId1),
    subjectId2:   parseId(subjectId2),
    staffId1:     parseId(staffId1),
    staffId2:     parseId(staffId2),
  });
  res.json(ApiResponse.success('Slot updated', { slot }));
};

// ── DELETE /campuses/:campusId/timetable/periods/:periodId/classes/:classGroupId/sections/:sectionId/slot ──

const clearSlotCtrl = async (req, res) => {
  const { campusId, classGroupId, sectionId, periodId } = matchedData(req, { locations: ['params'] });
  await clearSlot({
    campusId:     parseInt(campusId),
    classGroupId: parseInt(classGroupId),
    sectionId:    parseInt(sectionId),
    periodId:     parseInt(periodId),
  });
  res.json(ApiResponse.success('Slot cleared'));
};

// ── POST /campuses/:campusId/timetable/slots/swap ──────────────────────────────
const swapSlotsCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { slotA, slotB } = req.body;
  const result = await swapSlots({
    campusId: parseInt(campusId),
    slotA: {
      periodId:     parseInt(slotA.periodId),
      classGroupId: parseInt(slotA.classGroupId),
      sectionId:    parseInt(slotA.sectionId),
    },
    slotB: {
      periodId:     parseInt(slotB.periodId),
      classGroupId: parseInt(slotB.classGroupId),
      sectionId:    parseInt(slotB.sectionId),
    },
  });
  res.json(ApiResponse.success('Slots swapped', result));
};

module.exports = {
  upsertSlot: upsertSlotCtrl,
  clearSlot:  clearSlotCtrl,
  swapSlots:  swapSlotsCtrl,
};

const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  listFeeStructures,
  getFeeStructureById,
  upsertFeeStructure,
  deleteFeeStructure,
} = require('../services/feeStructures.service');

// ── GET /campuses/:campusId/fee-structures ───────────────────────────────────────
const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, classGroupId, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listFeeStructures({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId: classGroupId ? parseInt(classGroupId) : undefined,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 50,
  });
  res.json(ApiResponse.success('Fee structures fetched', result));
};

// ── GET /campuses/:campusId/fee-structures/:feeStructureId ──────────────────────
const getOneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const feeStructureId = parseInt(req.params.feeStructureId);
  const feeStructure = await getFeeStructureById(feeStructureId, campusId);
  res.json(ApiResponse.success('Fee structure fetched', { feeStructure }));
};

// ── POST /campuses/:campusId/fee-structures (create-or-update) ──────────────────
const upsertCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, classGroupId, sectionId, feeHeadId, amount, dueDay } = matchedData(req, { locations: ['body'] });
  const feeStructure = await upsertFeeStructure({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId: parseInt(classGroupId),
    sectionId: sectionId ? parseInt(sectionId) : null,
    feeHeadId: parseInt(feeHeadId),
    amount,
    dueDay: parseInt(dueDay),
  });
  res.json(ApiResponse.success('Fee structure saved', { feeStructure }));
};

// ── DELETE /campuses/:campusId/fee-structures/:feeStructureId ───────────────────
const deleteCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const feeStructureId = parseInt(req.params.feeStructureId);
  await deleteFeeStructure(feeStructureId, campusId);
  res.json(ApiResponse.success('Fee structure deleted successfully'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, upsert: upsertCtrl, delete: deleteCtrl };
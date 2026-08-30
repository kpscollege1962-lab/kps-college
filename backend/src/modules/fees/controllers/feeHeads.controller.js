const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  listFeeHeads,
  getFeeHeadById,
  createFeeHead,
  updateFeeHead,
  deleteFeeHead,
} = require('../services/feeHeads.service');

// ── GET /campuses/:campusId/fee-heads ────────────────────────────────────────────
const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { search, category, isActive, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listFeeHeads({
    campusId,
    search,
    category,
    isActive,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Fee heads fetched', result));
};

// ── GET /campuses/:campusId/fee-heads/:feeHeadId ─────────────────────────────────
const getOneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const feeHeadId = parseInt(req.params.feeHeadId);
  const feeHead = await getFeeHeadById(feeHeadId, campusId);
  res.json(ApiResponse.success('Fee head fetched', { feeHead }));
};

// ── POST /campuses/:campusId/fee-heads ───────────────────────────────────────────
const createCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const data = matchedData(req, { locations: ['body'] });
  const feeHead = await createFeeHead({ campusId, ...data });
  res.status(201).json(ApiResponse.success('Fee head created', { feeHead }));
};

// ── PATCH /campuses/:campusId/fee-heads/:feeHeadId ──────────────────────────────
const updateCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const feeHeadId = parseInt(req.params.feeHeadId);
  const data = matchedData(req, { locations: ['body'] });
  const feeHead = await updateFeeHead(feeHeadId, campusId, data);
  res.json(ApiResponse.success('Fee head updated', { feeHead }));
};

// ── DELETE /campuses/:campusId/fee-heads/:feeHeadId ─────────────────────────────
const deleteCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const feeHeadId = parseInt(req.params.feeHeadId);
  await deleteFeeHead(feeHeadId, campusId);
  res.json(ApiResponse.success('Fee head deleted successfully'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl };
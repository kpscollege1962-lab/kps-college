const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getRaw, resolveSettings, updateSettings } = require('../services/campus-settings.service');

// ── GET /campuses/:campusId/settings ──────────────────────────────────────────

const getCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId, 10);
  const [raw, resolved] = await Promise.all([
    getRaw(campusId),
    resolveSettings(campusId),
  ]);
  res.json(ApiResponse.success('Campus settings fetched', { raw, resolved }));
};

// ── PATCH /campuses/:campusId/settings ────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId, 10);
  const data = matchedData(req, { locations: ['body'] });
  const resolved = await updateSettings(campusId, data);
  res.json(ApiResponse.success('Campus settings updated', { resolved }));
};

module.exports = { get: getCtrl, update: updateCtrl };

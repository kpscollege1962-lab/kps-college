const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getSettings, updateSettings } = require('../services/school-settings.service');

// ── GET /school-settings ───────────────────────────────────────────────────────

const getCtrl = async (req, res) => {
  const settings = await getSettings();
  res.json(ApiResponse.success('School settings fetched', { settings }));
};

// ── PATCH /school-settings ─────────────────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const settings = await updateSettings(data);
  res.json(ApiResponse.success('School settings updated', { settings }));
};

module.exports = { get: getCtrl, update: updateCtrl };

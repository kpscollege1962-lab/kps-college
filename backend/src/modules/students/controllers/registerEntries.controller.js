const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listRegisterEntries, upsertRegisterEntry, deleteRegisterEntry } = require('../services/registerEntries.service');

// ── GET /students/:studentId/register-entries ──────────────────────────────────

const listCtrl = async (req, res) => {
  const { studentId } = matchedData(req, { locations: ['params'] });
  const entries = await listRegisterEntries(parseInt(studentId));
  res.json(ApiResponse.success('Register entries fetched', { entries }));
};

// ── PUT /students/:studentId/register-entries/:level ──────────────────────────

const upsertCtrl = async (req, res) => {
  const { studentId, level, ...data } = matchedData(req, { locations: ['params', 'body'] });
  const entry = await upsertRegisterEntry(parseInt(studentId), level, data);
  res.json(ApiResponse.success('Register entry saved', { entry }));
};

// ── DELETE /students/:studentId/register-entries/:level ───────────────────────

const removeCtrl = async (req, res) => {
  const { studentId, level } = matchedData(req, { locations: ['params'] });
  await deleteRegisterEntry(parseInt(studentId), level);
  res.json(ApiResponse.success('Register entry removed'));
};

module.exports = { list: listCtrl, upsert: upsertCtrl, remove: removeCtrl };

const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getRotaDay, saveRotaDay, deleteRotaDay } = require('../services/rota.service');

// ── GET /campuses/:campusId/rota?date=YYYY-MM-DD ────────────────────────────────
const getCtrl = async (req, res) => {
  const { date } = matchedData(req, { locations: ['query'] });
  const rota = await getRotaDay({ campusId: parseInt(req.params.campusId), date });
  res.json(ApiResponse.success('Rota fetched', { rota }));
};

// ── PUT /campuses/:campusId/rota/:date  (status draft | issued) ──────────────────
// Body read from req.body: express-validator drops nulls (substituteStaffId: null = not covered).
const saveCtrl = async (req, res) => {
  const { date } = matchedData(req, { locations: ['params'] });
  const { status, absentStaffIds = [], entries = [] } = req.body;
  const rota = await saveRotaDay({
    campusId: parseInt(req.params.campusId),
    date,
    status,
    absentStaffIds: absentStaffIds.map((id) => parseInt(id)),
    entries: entries.map((e) => ({
      periodId: parseInt(e.periodId),
      classGroupId: parseInt(e.classGroupId),
      sectionId: parseInt(e.sectionId),
      absentStaffId: parseInt(e.absentStaffId),
      substituteStaffId: e.substituteStaffId == null ? null : parseInt(e.substituteStaffId),
      forced: Boolean(e.forced),
      forceReason: e.forceReason ?? null,
    })),
    userId: req.user.id,
  });
  res.json(ApiResponse.success(status === 'issued' ? 'Rota issued' : 'Rota saved as draft', { rota }));
};

// ── DELETE /campuses/:campusId/rota/:date ────────────────────────────────────────
const deleteCtrl = async (req, res) => {
  const { date } = matchedData(req, { locations: ['params'] });
  await deleteRotaDay({ campusId: parseInt(req.params.campusId), date });
  res.json(ApiResponse.success('Rota deleted'));
};

module.exports = { get: getCtrl, save: saveCtrl, delete: deleteCtrl };

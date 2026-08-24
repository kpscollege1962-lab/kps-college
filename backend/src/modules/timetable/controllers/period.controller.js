const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { createPeriod, batchUpdateTimings, updateBreaks, deletePeriod } = require('../services/period.service');

// ── POST /campuses/:campusId/timetable/periods ─────────────────────────────────

const createPeriodCtrl = async (req, res) => {
  const { campusId, periodNumber } = matchedData(req, { locations: ['params', 'body'] });
  const period = await createPeriod({ campusId: parseInt(campusId), periodNumber: parseInt(periodNumber) });
  res.status(201).json(ApiResponse.success('Period created', { period }));
};

// ── PATCH /campuses/:campusId/timetable/timings/batch ─────────────────────────

const batchUpdateTimingsCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { timings } = req.body;
  const updatedTimings = await batchUpdateTimings({
    campusId: parseInt(campusId),
    timings,
  });
  res.json(ApiResponse.success('Timings updated', { timings: updatedTimings }));
};

// ── PATCH /campuses/:campusId/timetable/periods/:periodId/breaks ───────────────

const updateBreaksCtrl = async (req, res) => {
  const { campusId, periodId } = matchedData(req, { locations: ['params'] });
  const { fdBreakDuration, hdBreakDuration, beforeSlots, afterSlots } = req.body;
  const period = await updateBreaks({
    campusId:        parseInt(campusId),
    periodId:        parseInt(periodId),
    fdBreakDuration: fdBreakDuration ?? null,
    hdBreakDuration: hdBreakDuration ?? null,
    beforeSlots:     beforeSlots ?? [],
    afterSlots:      afterSlots ?? [],
  });
  res.json(ApiResponse.success('Breaks updated', { period }));
};

// ── DELETE /campuses/:campusId/timetable/periods/:periodId ─────────────────────

const deletePeriodCtrl = async (req, res) => {
  const { campusId, periodId } = matchedData(req, { locations: ['params'] });
  await deletePeriod({ campusId: parseInt(campusId), periodId: parseInt(periodId) });
  res.json(ApiResponse.success('Period deleted successfully'));
};

module.exports = {
  createPeriod:       createPeriodCtrl,
  batchUpdateTimings: batchUpdateTimingsCtrl,
  updateBreaks:       updateBreaksCtrl,
  deletePeriod:       deletePeriodCtrl,
};

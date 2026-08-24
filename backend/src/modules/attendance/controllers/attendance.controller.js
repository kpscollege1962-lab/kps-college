const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  getMySections, getOrCreateSession, saveRecords, submitSession, reopenSession, updateRemarks,
} = require('../services/attendance.service');

// ── GET /my-sections ─────────────────────────────────────────────────────────────

const getMySectionsCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { sessionId, date } = matchedData(req, { locations: ['query'] });
  const sections = await getMySections({ ability: req.ability, userId: req.user.id, campusId, sessionId, date });
  res.json(ApiResponse.success('Sections fetched', { sections }));
};

// ── POST /sessions ───────────────────────────────────────────────────────────────

const getOrCreateSessionCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { date, sectionId, classGroupId } = matchedData(req, { locations: ['body'] });
  const result = await getOrCreateSession({
    ability: req.ability, userId: req.user.id, campusId, sectionId, classGroupId, date,
  });
  res.json(ApiResponse.success('Attendance register loaded', result));
};

// ── PUT /sessions/:attendanceSessionId/records ──────────────────────────────────

const saveRecordsCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { attendanceSessionId, records } = matchedData(req, { locations: ['params', 'body'] });
  const saved = await saveRecords({
    ability: req.ability, userId: req.user.id, campusId, attendanceSessionId, records,
  });
  res.json(ApiResponse.success('Attendance records saved', { records: saved }));
};

// ── POST /sessions/:attendanceSessionId/submit ──────────────────────────────────

const submitSessionCtrl = async (req, res) => {
  const { attendanceSessionId } = matchedData(req, { locations: ['params'] });
  const { campusId } = req.params;
  const session = await submitSession({ ability: req.ability, userId: req.user.id, campusId, attendanceSessionId });
  res.json(ApiResponse.success('Register submitted', { session }));
};

// ── POST /sessions/:attendanceSessionId/reopen ──────────────────────────────────

const reopenSessionCtrl = async (req, res) => {
  const { attendanceSessionId } = matchedData(req, { locations: ['params'] });
  const { campusId } = req.params;
  const session = await reopenSession({ campusId, attendanceSessionId });
  res.json(ApiResponse.success('Register reopened', { session }));
};

// ── PATCH /records/:recordId/remarks ────────────────────────────────────────────

const updateRemarksCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { recordId, remarks } = matchedData(req, { locations: ['params', 'body'] });
  const record = await updateRemarks({ campusId, recordId, remarks });
  res.json(ApiResponse.success('Remarks updated', { record }));
};

module.exports = {
  getMySectionsCtrl, getOrCreateSessionCtrl, saveRecordsCtrl, submitSessionCtrl, reopenSessionCtrl, updateRemarksCtrl,
};

const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listAssignments, addAssignment, removeAssignment, searchCampusStaff } = require('../services/classTeacherAssignments.service');

// ── GET / ────────────────────────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { campusId, sessionId } = matchedData(req, { locations: ['query'] });
  const classes = await listAssignments({ campusId, sessionId });
  res.json(ApiResponse.success('Class teacher assignments fetched', { classes }));
};

// ── POST / ───────────────────────────────────────────────────────────────────────

const addCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const assignment = await addAssignment(data);
  res.status(201).json(ApiResponse.success('Assignment created', { assignment }));
};

// ── DELETE /:assignmentId ─────────────────────────────────────────────────────────

const removeCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { assignmentId } = matchedData(req, { locations: ['params'] });
  await removeAssignment({ campusId, assignmentId });
  res.json(ApiResponse.success('Assignment removed'));
};

// ── GET /staff-search ──────────────────────────────────────────────────────────────

const searchStaffCtrl = async (req, res) => {
  const { campusId } = req.params
  const { search } = matchedData(req, { locations: ['query'] });
  const staff = await searchCampusStaff({ campusId, search });
  res.json(ApiResponse.success('Campus staff fetched', { staff }));
};

module.exports = { list: listCtrl, add: addCtrl, remove: removeCtrl, searchStaff: searchStaffCtrl };

const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getClassWisePreview, getStaffWisePreview, getSubjectWisePreview } = require('../services/timetablePreview.service');

// ── GET /campuses/:campusId/timetable/preview/class ────────────────────────────

const getClassWisePreviewCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const { periods, rows } = await getClassWisePreview({
    campusId:  parseInt(campusId),
    sessionId: parseInt(sessionId),
  });
  res.json(ApiResponse.success('Class-wise timetable preview fetched', { periods, rows }));
};

// ── GET /campuses/:campusId/timetable/preview/staff ────────────────────────────

const getStaffWisePreviewCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const staff = await getStaffWisePreview({
    campusId:  parseInt(campusId),
    sessionId: parseInt(sessionId),
  });
  res.json(ApiResponse.success('Staff-wise timetable preview fetched', { staff }));
};

// ── GET /campuses/:campusId/timetable/preview/subject ───────────────────────────

const getSubjectWisePreviewCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const subjects = await getSubjectWisePreview({
    campusId:  parseInt(campusId),
    sessionId: parseInt(sessionId),
  });
  res.json(ApiResponse.success('Subject-wise timetable preview fetched', { subjects }));
};

module.exports = {
  getClassWisePreview:   getClassWisePreviewCtrl,
  getStaffWisePreview:   getStaffWisePreviewCtrl,
  getSubjectWisePreview: getSubjectWisePreviewCtrl,
};

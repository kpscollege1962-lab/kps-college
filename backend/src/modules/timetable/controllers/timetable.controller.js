const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getCampusTimetable, getClassTimetable, getTimetableStaff } = require('../services/timetable.service');

// ── GET /campuses/:campusId/timetable ──────────────────────────────────────────

const getCampusTimetableCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const { periods, rows } = await getCampusTimetable({
    campusId:  parseInt(campusId),
    sessionId: parseInt(sessionId),
  });
  res.json(ApiResponse.success('Timetable fetched', { periods, rows }));
};

// ── GET /campuses/:campusId/timetable/class ────────────────────────────────────

const getClassTimetableCtrl = async (req, res) => {
  const { campusId, classGroupId, sectionId } = matchedData(req, { locations: ['params', 'query'] });
  const periods = await getClassTimetable({
    campusId:     parseInt(campusId),
    classGroupId: parseInt(classGroupId),
    sectionId:    parseInt(sectionId),
  });
  res.json(ApiResponse.success('Class timetable fetched', { periods }));
};

// ── GET /campuses/:campusId/timetable/staff ────────────────────────────────────

const getTimetableStaffCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['params'] });
  const staff = await getTimetableStaff({ campusId: parseInt(campusId) });
  res.json(ApiResponse.success('Staff fetched', { staff }));
};

module.exports = {
  getCampusTimetable:  getCampusTimetableCtrl,
  getClassTimetable:   getClassTimetableCtrl,
  getTimetableStaff:   getTimetableStaffCtrl,
};

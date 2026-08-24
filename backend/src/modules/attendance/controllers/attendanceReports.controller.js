const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getStatusListReport, listReportSections, getClassRegisterReport } = require('../services/attendanceReports.service');

const getStatusListReportCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { sessionId, dateFrom, dateTo, statuses } = matchedData(req, { locations: ['query'] });
  const statusList = statuses ? statuses.split(',') : undefined;

  const records = await getStatusListReport({ campusId, sessionId, dateFrom, dateTo, statuses: statusList });
  res.json(ApiResponse.success('Status list report generated', { records }));
};

const listReportSectionsCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const sections = await listReportSections({ campusId, sessionId });
  res.json(ApiResponse.success('Sections fetched', { sections }));
};

const getClassRegisterReportCtrl = async (req, res) => {
  const { campusId } = req.params;
  const { sessionId, sectionId, dateFrom, dateTo } = matchedData(req, { locations: ['query'] });
  const report = await getClassRegisterReport({ campusId, sessionId, sectionId, dateFrom, dateTo });
  res.json(ApiResponse.success('Class register report generated', { report }));
};

module.exports = { getStatusListReportCtrl, listReportSectionsCtrl, getClassRegisterReportCtrl };

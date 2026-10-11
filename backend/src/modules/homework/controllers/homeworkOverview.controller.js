const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listHomeworkOverview, getHomeworkStructure } = require('../services/homeworkOverview.service');

const overviewCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, dueFrom, dueTo } = matchedData(req, { locations: ['query'] });
  const result = await listHomeworkOverview({ campusId, sessionId: parseInt(sessionId), dueFrom, dueTo });
  res.json(ApiResponse.success('Assignments fetched', result));
};

const structureCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const structure = await getHomeworkStructure({ campusId, sessionId: parseInt(sessionId) });
  res.json(ApiResponse.success('Assignment structure fetched', { structure }));
};

module.exports = { overview: overviewCtrl, structure: structureCtrl };
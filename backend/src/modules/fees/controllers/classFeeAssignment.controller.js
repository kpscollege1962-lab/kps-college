const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { getClassFeeSetup, assignClassFees } = require('../services/classFeeAssignment.service');

const getSetupCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const classGroupId = parseInt(req.params.classGroupId);
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const setup = await getClassFeeSetup({ campusId, sessionId: parseInt(sessionId), classGroupId });
  res.json(ApiResponse.success('Class fee setup fetched', { setup }));
};

const assignCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const classGroupId = parseInt(req.params.classGroupId);
  const { sessionId, dueDay, items } = matchedData(req, { locations: ['body'] });
  const result = await assignClassFees({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId,
    dueDay: parseInt(dueDay),
    items,
  });
  res.status(201).json(ApiResponse.success('Fees assigned and challans generated', result));
};

module.exports = { getSetup: getSetupCtrl, assign: assignCtrl };
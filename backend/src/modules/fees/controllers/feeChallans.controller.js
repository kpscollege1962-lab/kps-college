const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listChallans, getChallanById, generateChallans, cancelChallan } = require('../services/feeChallans.service');

const generateCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, month, year, classGroupId } = matchedData(req, { locations: ['body'] });
  const result = await generateChallans({
    campusId,
    sessionId: parseInt(sessionId),
    month: parseInt(month),
    year: parseInt(year),
    classGroupId: classGroupId ? parseInt(classGroupId) : undefined,
  });
  res.status(201).json(ApiResponse.success('Fee challans generated', result));
};

const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, classGroupId, sectionId, status, month, year, search, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listChallans({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId: classGroupId ? parseInt(classGroupId) : undefined,
    sectionId: sectionId ? parseInt(sectionId) : undefined,
    status, search,
    month: month ? parseInt(month) : undefined,
    year: year ? parseInt(year) : undefined,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Fee challans fetched', result));
};

const getOneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const challanId = parseInt(req.params.challanId);
  const challan = await getChallanById(challanId, campusId);
  res.json(ApiResponse.success('Fee challan fetched', { challan }));
};

const cancelCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const challanId = parseInt(req.params.challanId);
  const challan = await cancelChallan(challanId, campusId);
  res.json(ApiResponse.success('Fee challan cancelled', { challan }));
};

module.exports = { generate: generateCtrl, list: listCtrl, getOne: getOneCtrl, cancel: cancelCtrl };
const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listStaff, getStaffById, createStaff, updateStaff, searchEligibleStaff } = require('../services/staff.service');

const listCtrl = async (req, res) => {
  const { campusId, search, isActive, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listStaff({
    campusId: parseInt(campusId),
    search,
    isActive,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Staff fetched', result));
};

const getOneCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const staffId      = parseInt(req.params.staffId);
  const staff = await getStaffById(parseInt(campusId), staffId);
  res.json(ApiResponse.success('Staff member fetched', { staff }));
};

const createCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const data         = matchedData(req, { locations: ['body'] });
  const staff = await createStaff(parseInt(campusId), data);
  res.status(201).json(ApiResponse.success('Staff member created', { staff }));
};

const updateCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const data         = matchedData(req, { locations: ['body'] });
  const staffId      = parseInt(req.params.staffId);
  const staff = await updateStaff(parseInt(campusId), staffId, data);
  res.json(ApiResponse.success('Staff member updated', { staff }));
};

const searchEligibleCtrl = async (req, res) => {
  const { campusId, search } = matchedData(req, { locations: ['query'] });
  const staff                = await searchEligibleStaff(parseInt(campusId), search);
  res.json(ApiResponse.success('Eligible staff fetched', { staff }));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, searchEligible: searchEligibleCtrl };

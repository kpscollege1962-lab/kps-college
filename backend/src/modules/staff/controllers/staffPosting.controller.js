const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { updateStaffPosting, createStaffPosting } = require('../services/staffPosting.service');
const { getStaffById } = require('../services/staff.service');

const createPostingCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const data         = matchedData(req, { locations: ['body'] });
  const staffId      = parseInt(req.params.staffId);
  await createStaffPosting(staffId, parseInt(campusId), {
    employee_no:             data.employee_no,
    joining_date:            data.joining_date,
    isTimetableEligible:     data.isTimetableEligible,
    allowConcurrentPeriods:  data.allowConcurrentPeriods,
  });
  const staff = await getStaffById(parseInt(campusId), staffId);
  res.status(201).json(ApiResponse.success('Staff member added to campus', { staff }));
};

const updatePostingCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const data         = matchedData(req, { locations: ['body'] });
  const staffId      = parseInt(req.params.staffId);
  const posting = await updateStaffPosting(parseInt(campusId), staffId, data);
  res.json(ApiResponse.success('Staff posting updated', { posting }));
};

module.exports = { createPosting: createPostingCtrl, updatePosting: updatePostingCtrl };

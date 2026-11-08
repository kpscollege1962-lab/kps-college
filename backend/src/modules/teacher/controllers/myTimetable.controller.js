const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listMyTimetable } = require('../services/myTimetable.service');

const listCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const entries = await listMyTimetable(req.user.id, parseInt(campusId));
  res.json(ApiResponse.success('Timetable fetched', { entries }));
};

module.exports = { list: listCtrl };
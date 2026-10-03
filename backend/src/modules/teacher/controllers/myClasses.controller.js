const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const { listMyTeachingClasses } = require('../services/myClasses.service');

const listCtrl = async (req, res) => {
  const campusId = parseInt(req.query.campusId);
  if (!campusId) throw new ApiError(422, 'campusId is required');
  const classes = await listMyTeachingClasses(req.user.id, campusId);
  res.json(ApiResponse.success('Teaching classes fetched', { classes }));
};

module.exports = { list: listCtrl };
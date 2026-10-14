const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const { getSheetBranding } = require('../services/homeworkBranding.service');

const brandingCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  if (!Number.isInteger(campusId) || campusId < 1) throw new ApiError(422, 'Invalid campus');

  const branding = await getSheetBranding(campusId);
  res.json(ApiResponse.success('Sheet branding fetched', { branding }));
};

module.exports = { branding: brandingCtrl };
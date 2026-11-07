const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const { getPrintBranding } = require('../services/campusBranding.service');

// GET /campuses/:campusId/print-branding
const getCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  if (!Number.isInteger(campusId) || campusId < 1) throw new ApiError(422, 'Invalid campus');

  const branding = await getPrintBranding(campusId);
  res.json(ApiResponse.success('Print branding fetched', { branding }));
};

module.exports = { get: getCtrl };
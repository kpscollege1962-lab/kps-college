const ApiResponse = require('../../../utils/ApiResponse');
const { listMyFeeChallans } = require('../services/myFees.service');

// ── GET /me/fee-challans ────────────────────────────────────────────────────────
const listCtrl = async (req, res) => {
  const result = await listMyFeeChallans(req.user.id);
  res.json(ApiResponse.success('Fee challans fetched', result));
};

module.exports = { list: listCtrl };
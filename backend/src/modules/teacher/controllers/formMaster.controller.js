const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listMyFormMasterClasses } = require('../utils/formMaster');

const listCtrl = async (req, res) => {
  const { campusId } = matchedData(req, { locations: ['query'] });
  const classes = await listMyFormMasterClasses(req.user.id, parseInt(campusId));
  res.json(ApiResponse.success('Form-master classes fetched', { classes }));
};

module.exports = { list: listCtrl };

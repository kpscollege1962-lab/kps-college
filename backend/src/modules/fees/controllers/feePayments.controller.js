const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { recordPayment, voidPayment } = require('../services/feePayments.service');

const createCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const challanId = parseInt(req.params.challanId);
  const { amount, paymentDate, method, referenceNo, notes } = matchedData(req, { locations: ['body'] });
  const payment = await recordPayment({
    challanId,
    campusId,
    amount,
    paymentDate: paymentDate || new Date(),
    method: method || 'cash',
    referenceNo,
    receivedBy: req.user.id,
    notes,
  });
  res.status(201).json(ApiResponse.success('Payment recorded', { payment }));
};

const deleteCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const challanId = parseInt(req.params.challanId);
  const paymentId = parseInt(req.params.paymentId);
  await voidPayment(paymentId, challanId, campusId);
  res.json(ApiResponse.success('Payment voided successfully'));
};

module.exports = { create: createCtrl, delete: deleteCtrl };
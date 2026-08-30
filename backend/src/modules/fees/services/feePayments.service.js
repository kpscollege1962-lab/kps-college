const { FeeChallan, FeePayment, sequelize } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const recalculateStatus = (totalAmount, paidAmount) => {
  if (paidAmount <= 0) return 'unpaid';
  if (paidAmount >= totalAmount) return 'paid';
  return 'partial';
};

// ── Record a payment against a challan (supports partial payments) ────────────
const recordPayment = async ({ challanId, campusId, amount, paymentDate, method, referenceNo, receivedBy, notes }) => {
  const challan = await FeeChallan.findOne({ where: { id: challanId, campus_id: campusId } });
  if (!challan) throw new ApiError(404, 'Fee challan not found');
  if (challan.status === 'cancelled') throw new ApiError(400, 'Cannot record a payment against a cancelled challan');

  const remaining = parseFloat(challan.total_amount) - parseFloat(challan.paid_amount);
  if (amount > remaining) {
    throw new ApiError(400, `Payment amount (${amount}) exceeds remaining balance of ${remaining.toFixed(2)}`);
  }

  const transaction = await sequelize.transaction();
  try {
    const payment = await FeePayment.create({
      challan_id: challanId,
      amount,
      payment_date: paymentDate,
      method,
      reference_no: referenceNo,
      received_by: receivedBy,
      notes,
    }, { transaction });

    const newPaidAmount = parseFloat(challan.paid_amount) + parseFloat(amount);
    await challan.update({
      paid_amount: newPaidAmount,
      status: recalculateStatus(parseFloat(challan.total_amount), newPaidAmount),
    }, { transaction });

    await transaction.commit();
    return payment;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// ── Void a payment (correction/reversal) — deletes the record and recalculates ─
const voidPayment = async (paymentId, challanId, campusId) => {
  const challan = await FeeChallan.findOne({ where: { id: challanId, campus_id: campusId } });
  if (!challan) throw new ApiError(404, 'Fee challan not found');

  const payment = await FeePayment.findOne({ where: { id: paymentId, challan_id: challanId } });
  if (!payment) throw new ApiError(404, 'Payment not found for this challan');

  const transaction = await sequelize.transaction();
  try {
    const newPaidAmount = parseFloat(challan.paid_amount) - parseFloat(payment.amount);
    await payment.destroy({ transaction });
    await challan.update({
      paid_amount: newPaidAmount,
      status: recalculateStatus(parseFloat(challan.total_amount), newPaidAmount),
    }, { transaction });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = { recordPayment, voidPayment };
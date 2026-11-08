const { Staff } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const getMyStaffRecord = async (userId) => {
  const staff = await Staff.findOne({ where: { user_id: userId } });
  if (!staff) throw new ApiError(403, 'Your account is not linked to a staff record');
  return staff;
};

module.exports = { getMyStaffRecord };
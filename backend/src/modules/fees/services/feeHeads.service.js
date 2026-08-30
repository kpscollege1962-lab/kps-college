const { Op } = require('sequelize');
const { FeeHead } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const getFeeHeadById = async (feeHeadId, campusId) => {
  const feeHead = await FeeHead.findOne({ where: { id: feeHeadId, campus_id: campusId } });
  if (!feeHead) throw new ApiError(404, 'Fee head not found');
  return feeHead;
};

const listFeeHeads = async ({ campusId, search, category, isActive, page = 1, limit = 20 }) => {
  const where = { campus_id: campusId };
  if (search)   where.name     = { [Op.like]: `%${search}%` };
  if (category) where.category = category;
  if (isActive !== undefined) where.is_active = isActive;

  const offset = (page - 1) * limit;
  const { count, rows } = await FeeHead.findAndCountAll({
    where,
    order: [['category', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
  });
  return { data: rows, total: count, page, limit };
};

const createFeeHead = async ({ campusId, name, category }) => {
  const trimmed = name.trim();
  const duplicate = await FeeHead.findOne({ where: { campus_id: campusId, name: trimmed } });
  if (duplicate) {
    throw new ApiError(409, `A fee head named "${trimmed}" already exists for this campus`);
  }
  return FeeHead.create({ campus_id: campusId, name: trimmed, category });
};

const updateFeeHead = async (feeHeadId, campusId, { name, category, is_active }) => {
  const feeHead = await getFeeHeadById(feeHeadId, campusId);
  if (name !== undefined) {
    const trimmed = name.trim();
    const duplicate = await FeeHead.findOne({
      where: { campus_id: campusId, name: trimmed, id: { [Op.ne]: feeHeadId } },
    });
    if (duplicate) throw new ApiError(409, `A fee head named "${trimmed}" already exists for this campus`);
  }
  await feeHead.update({
    ...(name      !== undefined && { name: name.trim() }),
    ...(category  !== undefined && { category }),
    ...(is_active !== undefined && { is_active }),
  });
  return feeHead.reload();
};

const deleteFeeHead = async (feeHeadId, campusId) => {
  const feeHead = await getFeeHeadById(feeHeadId, campusId);
  await feeHead.destroy();
};

module.exports = { listFeeHeads, getFeeHeadById, createFeeHead, updateFeeHead, deleteFeeHead };
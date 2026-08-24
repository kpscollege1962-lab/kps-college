const { Op } = require('sequelize');
const { Campus, CampusSettings } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── List ───────────────────────────────────────────────────────────────────────

const listCampuses = async ({ search, isActive, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Campus.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getCampusById = async (id) => {
  const campus = await Campus.findByPk(id);
  if (!campus) throw new ApiError(404, 'Campus not found');
  return campus;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createCampus = async ({ name, code, address, phone, email, is_active }) => {
  const campus = await Campus.create({
    name,
    ...(code      !== undefined && { code }),
    ...(address   !== undefined && { address }),
    ...(phone     !== undefined && { phone }),
    ...(email     !== undefined && { email }),
    ...(is_active !== undefined && { is_active }),
  });

  await CampusSettings.create({ campus_id: campus.id });

  return campus;
};

// ── Update ─────────────────────────────────────────────────────────────────────

const updateCampus = async (id, { name, code, address, phone, email, is_active }) => {
  const campus = await Campus.findByPk(id);
  if (!campus) throw new ApiError(404, 'Campus not found');

  await campus.update({
    ...(name      !== undefined && { name }),
    ...(code      !== undefined && { code }),
    ...(address   !== undefined && { address }),
    ...(phone     !== undefined && { phone }),
    ...(email     !== undefined && { email }),
    ...(is_active !== undefined && { is_active }),
  });

  return getCampusById(id);
};

module.exports = { listCampuses, getCampusById, createCampus, updateCampus };

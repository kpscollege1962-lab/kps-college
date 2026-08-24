const { Op } = require('sequelize');
const bcrypt  = require('bcryptjs');
const { User, Role, Campus, UserGlobalRole, UserRoleCampus } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ── List ───────────────────────────────────────────────────────────────────────

const listUsers = async ({ search, isActive, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name:  { [Op.like]: `%${search}%` } },
      { username:   { [Op.like]: `%${search}%` } },
      { email:      { [Op.like]: `%${search}%` } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive ? 1 : 0;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// Lightweight profile — no roles attached.
// Used by auth flows where roles are returned as a separate top-level field.
const getUserProfile = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// Internal — finds by email OR username and includes password_hash for bcrypt comparison.
// Not intended for use outside of auth flows.
const getUserByIdentifier = async (login) => {
  return User.findOne({
    where: {
      [Op.or]: [{ email: login }, { username: login }],
    },
  });
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createUser = async ({ first_name, last_name, username, email, phone, password, profile_photo }) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    first_name,
    last_name,
    username,
    email,
    password_hash,
    ...(phone         !== undefined && { phone }),
    ...(profile_photo !== undefined && { profile_photo }),
  });

  return getUserById(user.id);
};

// ── Update ─────────────────────────────────────────────────────────────────────

const updateUser = async (id, { first_name, last_name, username, email, phone, profile_photo, is_active }) => {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');

  await user.update({
    ...(first_name    !== undefined && { first_name }),
    ...(last_name     !== undefined && { last_name }),
    ...(username      !== undefined && { username }),
    ...(email         !== undefined && { email }),
    ...(phone         !== undefined && { phone }),
    ...(profile_photo !== undefined && { profile_photo }),
    ...(is_active     !== undefined && { is_active }),
  });

  return getUserById(id);
};

// ── Delete ─────────────────────────────────────────────────────────────────────

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');
  await user.destroy(); // paranoid: true → sets deleted_at, does not hard-delete
};

// ── Internal helpers ───────────────────────────────────────────────────────────

const updateLastLogin = async (id) => {
  await User.update({ last_login_at: new Date() }, { where: { id } });
};

// ── Role contexts ──────────────────────────────────────────────────────────────
// Returns all active role assignments for a user, shaped for the frontend
// context selector. Global assignments come first, then campus-scoped ones.

const getUserRoleContexts = async (userId) => {
  const [globalRows, campusRows] = await Promise.all([
    UserGlobalRole.findAll({
      where: { user_id: userId, is_active: 1 },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'layer'] }],
    }),
    UserRoleCampus.findAll({
      where: { user_id: userId, is_active: 1 },
      include: [
        { model: Role,   as: 'role',   attributes: ['id', 'name', 'layer'] },
        { model: Campus, as: 'campus', attributes: ['id', 'name'] },
      ],
    }),
  ]);

  const globalContexts = globalRows.map((row) => ({
    roleId:     row.role.id,
    roleName:   row.role.name,
    layer:      'global',
    campusId:   null,
    campusName: null,
  }));

  const campusContexts = campusRows.map((row) => ({
    roleId:     row.role.id,
    roleName:   row.role.name,
    layer:      'campus',
    campusId:   row.campus.id,
    campusName: row.campus.name,
  }));

  return [...globalContexts, ...campusContexts];
};

module.exports = {
  listUsers,
  getUserById,
  getUserProfile,
  getUserByIdentifier,
  createUser,
  updateUser,
  deleteUser,
  updateLastLogin,
  getUserRoleContexts,
};

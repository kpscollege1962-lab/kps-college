const bcrypt = require('bcryptjs');
const {
  getUserByIdentifier,
  getUserProfile,
  updateLastLogin,
  getUserRoleContexts,
} = require('../../users/services/users.service');
const { generateAccessToken, generateRefreshToken } = require('../../../utils/jwt');
const ApiError = require('../../../utils/ApiError');

// ── Login ──────────────────────────────────────────────────────────────────────
// Accepts email or username as the login identifier.

const login = async ({ login, password }) => {
  const user = await getUserByIdentifier(login);

  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.is_active) throw new ApiError(403, 'Account is deactivated');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  await updateLastLogin(user.id);

  const payload = { id: user.id, email: user.email, username: user.username };

  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  const [profile, contexts] = await Promise.all([
    getUserProfile(user.id),
    getUserRoleContexts(user.id),
  ]);

  return { user: profile, contexts, accessToken, refreshToken };
};

module.exports = { login };

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, PasswordResetToken } = require('../../../models');
const { addEmailJob } = require('../../../services/email/emailQueue');
const ApiError = require('../../../utils/ApiError');

const TOKEN_EXPIRES_MINUTES = 60;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ── Forgot password ────────────────────────────────────────────────────────────

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ where: { email } });

  // Return silently if the user doesn't exist or is inactive so that the
  // API response gives no hint about which emails are registered.
  if (!user || !user.is_active) return;

  // Invalidate all existing unused tokens for this user before creating a
  // new one — prevents multiple active reset links floating around.
  await PasswordResetToken.update(
    { used_at: new Date() },
    {
      where: {
        user_id: user.id,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    }
  );

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_MINUTES * 60 * 1000);

  await PasswordResetToken.create({ user_id: user.id, token, expires_at: expiresAt });

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await addEmailJob({
    to: user.email,
    subject: 'Reset your password',
    template: 'forgot-password',
    context: {
      firstName: user.first_name,
      resetLink,
      expiresIn: `${TOKEN_EXPIRES_MINUTES} minutes`,
    },
  });
};

// ── Reset password ─────────────────────────────────────────────────────────────

const resetPassword = async ({ token, password }) => {
  const tokenRecord = await PasswordResetToken.findOne({
    where: {
      token,
      used_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  // Intentionally vague error — don't reveal why the token failed.
  if (!tokenRecord) throw new ApiError(400, 'Invalid or expired reset token');

  const user = await User.findByPk(tokenRecord.user_id);
  if (!user || !user.is_active) throw new ApiError(400, 'Invalid or expired reset token');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Update password and mark token as consumed in parallel.
  await Promise.all([
    user.update({ password_hash }),
    tokenRecord.update({ used_at: new Date() }),
  ]);
};

module.exports = { forgotPassword, resetPassword };

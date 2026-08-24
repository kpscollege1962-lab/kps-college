module.exports = ({ User, PasswordResetToken }) => {
  User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });
  PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

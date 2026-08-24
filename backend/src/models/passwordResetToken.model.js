const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PasswordResetToken', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'password_reset_tokens',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['token'],   name: 'uq_token'    },
      {               fields: ['user_id'], name: 'idx_user_id' },
    ],
  });
};

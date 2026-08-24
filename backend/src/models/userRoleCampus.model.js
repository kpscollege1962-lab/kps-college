const { DataTypes } = require('sequelize');

// Campus-scoped role assignments ONLY.
// Only roles with layer='campus' should ever appear here.
// Global roles (SUPER_ADMIN, etc) are stored in
// user_global_roles instead — they never appear in this table.

module.exports = (sequelize) => {
  return sequelize.define('UserRoleCampus', {
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
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'campuses', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'user_role_campuses',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['user_id', 'role_id', 'campus_id'], name: 'uq_user_role_campus' },
      { fields: ['user_id'],   name: 'idx_urc_user_id'   },
      { fields: ['campus_id'], name: 'idx_urc_campus_id' },
      { fields: ['role_id'],   name: 'idx_urc_role_id'   },
    ],
  });
};

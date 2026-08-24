const { DataTypes } = require('sequelize');

// Global-layer role assignments ONLY.
// No campus_id — these roles operate across the entire platform.
// Only roles with layer='global' should ever appear here
// (SUPER_ADMIN, etc).
// This table is separate from user_role_campuses intentionally:
// - campus_id would be nullable there, breaking the unique constraint.
// - Having two tables keeps unique indexes correct at the DB level
//   and avoids polluting campuses table with a fake global row.

module.exports = (sequelize) => {
  return sequelize.define('UserGlobalRole', {
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
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'user_global_roles',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['user_id', 'role_id'], name: 'uq_user_global_role' },
      { fields: ['user_id'], name: 'idx_ugr_user_id' },
      { fields: ['role_id'], name: 'idx_ugr_role_id' },
    ],
  });
};

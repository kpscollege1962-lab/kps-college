const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'System identifier e.g. SUPER_ADMIN, TEACHER. Never changed after seeding.',
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Human-readable display name e.g. Super Admin',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    layer: {
      type: DataTypes.ENUM('global', 'campus'),
      allowNull: false,
      defaultValue: 'campus',
      comment: 'global = assigned via user_global_roles, no campus boundary. campus = assigned via user_role_campuses, scoped to one campus.',
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'roles',
    timestamps: true,
    paranoid: false,
  });
};

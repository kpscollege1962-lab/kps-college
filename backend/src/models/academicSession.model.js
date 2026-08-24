const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AcademicSession', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. 2024-25, Spring 2025',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'closing', 'completed'),
      allowNull: false,
      defaultValue: 'upcoming',
      comment: 'Session lifecycle: upcoming → active → closing → completed',
    },
  }, {
    tableName: 'academic_sessions',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['name'], name: 'uq_session_name' },
    ],
  });
};

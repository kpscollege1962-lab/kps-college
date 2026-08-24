const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name_initials: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('science', 'arts', 'commerce', 'general'),
      allowNull: false,
    },
  }, {
    tableName: 'subjects',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['name'],          name: 'uq_subject_name'          },
      { unique: true, fields: ['name_initials'], name: 'uq_subject_name_initials' },
    ],
  });
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Guardian', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Null until guardian accepts invitation and activates account',
    },
    first_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
      comment: 'Gives the name its Mr. / Miss title; filled from relationship (Father, Mother...) when empty',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    relationship: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. Father, Mother, Uncle',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'guardians',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['user_id'], name: 'idx_guardian_user_id' },
      { fields: ['email'],   name: 'idx_guardian_email'   },
    ],
  });
};

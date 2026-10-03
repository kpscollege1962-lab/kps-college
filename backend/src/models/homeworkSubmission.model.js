const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('HomeworkSubmission', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    homework_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'homeworks', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'A submission is meaningless without its parent homework post',
    },
    enrollment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'enrollments', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_public_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_original_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('submitted', 'done'),
      allowNull: false,
      defaultValue: 'submitted',
    },
    reviewed_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'staff', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'homework_submissions',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['homework_id', 'enrollment_id'], name: 'uq_submission_homework_enrollment' },
      { fields: ['enrollment_id'], name: 'idx_submission_enrollment_id' },
    ],
  });
};
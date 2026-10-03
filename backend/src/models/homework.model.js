const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Homework', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'campuses', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    subject_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'subjects', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    staff_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'staff', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Teacher who posted this homework',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    attachment_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Cloudinary public_id, needed to delete the file on edit/removal',
    },
    attachment_original_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'homeworks',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['class_group_id', 'section_id'], name: 'idx_homework_class_section' },
      { fields: ['staff_id'], name: 'idx_homework_staff_id' },
      { fields: ['session_id'], name: 'idx_homework_session_id' },
    ],
  });
};
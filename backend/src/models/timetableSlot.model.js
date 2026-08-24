// Content of a period for a specific class+section.
// Campus ownership is implicit via period_id → timetable_periods.campus_id.
// All content fields are nullable — an empty slot is valid.
// subject_id_2 present = alternating pair (e.g. History + Geography share this slot).
// label: user-defined display name.
// break_position: 'before' | 'after' | null — which break group this slot belongs to.
// Duration of the break is on timetable_period_timings.break_before / break_after.

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TimetableSlot', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    period_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'timetable_periods', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    subject_id_1: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'subjects', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    subject_id_2: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'subjects', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    staff_id_1: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'staff', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    staff_id_2: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'staff', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    break_position: {
      type: DataTypes.ENUM('before', 'after'),
      allowNull: true,
      defaultValue: null,
      comment: 'Which side of the instructional window this class/section takes their break',
    },
  }, {
    tableName: 'timetable_slots',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['period_id', 'class_group_id', 'section_id'], name: 'uq_slot' },
    ],
  });
};

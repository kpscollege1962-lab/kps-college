// Two timing profiles per period: full_day and half_day.
// Slots are shared across both configs — only the timings differ.

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TimetablePeriodTiming', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    period_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'timetable_periods', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    config: {
      type: DataTypes.ENUM('full_day', 'half_day'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    break_duration: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: 'Single break duration in minutes within this period. Position (before/after instruction) is per-slot via break_position.',
    },
  }, {
    tableName: 'timetable_period_timings',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['period_id', 'config'], name: 'uq_period_config' },
    ],
  });
};

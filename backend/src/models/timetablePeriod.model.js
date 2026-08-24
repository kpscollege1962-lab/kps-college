// Campus-wide period definitions.
// All classes and sections at a campus share the same period structure.
// Period timings (full_day / half_day) are stored in timetable_period_timings.

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TimetablePeriod', {
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
    period_number: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Display order of this period in the day (1, 2, 3...)',
    },
  }, {
    tableName: 'timetable_periods',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['campus_id', 'period_number'], name: 'uq_campus_period' },
    ],
  });
};

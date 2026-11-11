// Campus-wide period definitions.
// All classes and sections at a campus share the same period structure.
// Period timings (full_day / half_day) are stored in timetable_period_timings.
//
// Numbering: the assembly is its own period (is_assembly = 1, period_number = 0);
// the teaching periods are 1, 2, 3... so the stored number IS the label (P1, P2...).

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
      comment: 'Display order of this period in the day. 0 = the assembly, 1, 2, 3... = teaching periods (P1, P2...)',
    },
    is_assembly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'True for the campus assembly (period_number 0). At most one per campus.',
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
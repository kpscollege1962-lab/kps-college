const { DataTypes } = require('sequelize');

// One covered period on a rota day: the absent teacher's slot (period + class + section) and the
// teacher who takes it that day. substitute_staff_id NULL = not covered yet.
// forced: the substitute was busy (own class / another rota period / absent) and an admin forced it.
module.exports = (sequelize) => {
  return sequelize.define('RotaEntry', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    rota_day_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'rota_days', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    period_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'timetable_periods', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'class_groups', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'sections', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    absent_staff_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    substitute_staff_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: true,
      references: { model: 'staff', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE',
    },
    forced: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    force_reason: { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName: 'rota_entries',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['rota_day_id', 'period_id', 'class_group_id', 'section_id', 'absent_staff_id'], name: 'uq_rota_entry' },
      { fields: ['substitute_staff_id'], name: 'idx_rota_entry_substitute' },
    ],
  });
};

const { DataTypes } = require('sequelize');

// A teacher marked absent on a rota day (their periods that day are covered by rota entries).
module.exports = (sequelize) => {
  return sequelize.define('RotaAbsence', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    rota_day_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'rota_days', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    staff_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
  }, {
    tableName: 'rota_absences',
    timestamps: true,
    indexes: [{ unique: true, fields: ['rota_day_id', 'staff_id'], name: 'uq_rota_absence' }],
  });
};

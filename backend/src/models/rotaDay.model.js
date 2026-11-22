const { DataTypes } = require('sequelize');

// One campus's rota (daily arrangement for absent teachers) for one date.
// draft: being prepared, nobody else sees it. issued: in force for that date only.
module.exports = (sequelize) => {
  return sequelize.define('RotaDay', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: false,
      references: { model: 'campuses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    rota_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'issued'), allowNull: false, defaultValue: 'draft' },
    created_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: true,
      references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE',
    },
    issued_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED, allowNull: true,
      references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE',
    },
    issued_at: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'rota_days',
    timestamps: true,
    indexes: [{ unique: true, fields: ['campus_id', 'rota_date'], name: 'uq_rota_day_campus_date' }],
  });
};

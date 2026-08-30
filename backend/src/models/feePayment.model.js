const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FeePayment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    challan_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'fee_challans', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Payment history must never be silently lost via cascade delete',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'online', 'cheque'),
      allowNull: false,
      defaultValue: 'cash',
    },
    reference_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Bank transaction ID, cheque number, etc.',
    },
    received_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'fee_payments',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['challan_id'], name: 'idx_payment_challan_id' },
    ],
  });
};
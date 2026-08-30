const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FeeChallanItem', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    challan_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'fee_challans', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'Line items are meaningless without their parent challan',
    },
    fee_head_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'fee_heads', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'fee_challan_items',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['challan_id'], name: 'idx_challan_item_challan_id' },
    ],
  });
};
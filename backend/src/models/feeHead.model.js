const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FeeHead', {
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
      comment: 'Fee heads are campus-scoped, e.g. one campus may have Transport Fee and another may not',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. Tuition Fee, Transport Fee, Lab Fee',
    },
    category: {
      type: DataTypes.ENUM('fees', 'facilities', 'fines'),
      allowNull: false,
      defaultValue: 'fees',
      comment: 'Groups fee heads for the class fee-assignment UI',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Inactive fee heads are hidden from new fee structures but preserved for historical challans',
    },
  }, {
    tableName: 'fee_heads',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['campus_id', 'name'], name: 'uq_fee_head_campus_name' },
      { fields: ['campus_id'], name: 'idx_fee_head_campus_id' },
    ],
  });
};
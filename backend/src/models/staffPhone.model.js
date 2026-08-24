const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StaffPhone', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    staff_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'staff', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Free-text label e.g. Personal, Work, WhatsApp',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Only one phone per staff member should have is_primary = 1, enforced at service layer',
    },
  }, {
    tableName: 'staff_phones',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['staff_id'], name: 'idx_staff_phone_staff_id' },
    ],
  });
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StaffQualification', {
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
    type: {
      type: DataTypes.ENUM('academic', 'professional'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'e.g. BS Physics, B.Ed, Teaching Certificate in Early Childhood',
    },
    completion_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'staff_qualifications',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['staff_id'], name: 'idx_staff_qualification_staff_id' },
    ],
  });
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StudentContact', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name of the person who can be reached at this number',
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Descriptive label e.g. Father, Mother, Guardian, Emergency',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Only one contact per student should have is_primary = 1, enforced at service layer',
    },
  }, {
    tableName: 'student_contacts',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['student_id'], name: 'idx_student_contact_student_id' },
      { fields: ['phone'], name: 'idx_student_contact_phone' },
    ],
  });
};

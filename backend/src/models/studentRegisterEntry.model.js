const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StudentRegisterEntry', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    register_level: {
      type: DataTypes.ENUM('pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'),
      allowNull: false,
    },
    admission_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Serial number from the government hard register for this education level',
    },
    entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date this entry was made in the hard register',
    },
    class_of_admission: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Class the student was in when first admitted to this register level — free text, not linked to class_groups',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'e.g. correction entry, re-admission',
    },
  }, {
    tableName: 'student_register_entries',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['student_id', 'register_level'], name: 'uq_student_register_level' },
      { unique: true, fields: ['register_level', 'admission_no'], name: 'uq_level_admission_no' },
      { fields: ['student_id'], name: 'idx_register_entry_student_id' },
    ],
  });
};

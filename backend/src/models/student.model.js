const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Null until student portal access is granted. Managed by a dedicated account-linking flow, not the student create/update endpoints.',
    },
    gr_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'GR number, unique school-wide, assigned at registration, write-once',
    },
    full_name: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    b_form_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'NADRA child registration certificate number (B-Form)',
    },
    religion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    blood_group: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: 'e.g. A+, B-, O+',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admission_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    father_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    father_cnic: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Pakistani national identity card number of father',
    },
    father_occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    domicile_district: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'District of domicile, required for board exam registration',
    },
  }, {
    tableName: 'students',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['gr_no'], name: 'uq_gr_no' },
      { unique: true, fields: ['b_form_no'], name: 'uq_b_form_no' },
      { fields: ['user_id'], name: 'idx_student_user_id' },
    ],
  });
};

const { DataTypes } = require('sequelize');
const { withTitle, stripTitle } = require('../utils/personTitle');

module.exports = (sequelize) => {
  return sequelize.define('Staff', {
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
      comment: 'Null until portal access is granted. Managed by dedicated account-linking flow, not the staff create/update endpoints.',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      // Read: "Mr. NAME" / "Miss NAME" by gender (utils/personTitle). Save: any title is stripped,
      // so the stored name is always plain. Plain value: staff.getDataValue('full_name').
      get() {
        return withTitle(this.getDataValue('full_name'), this.getDataValue('gender'));
      },
      set(value) {
        this.setDataValue('full_name', stripTitle(value));
      },
    },
    name_initials: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    marital_status: {
      type: DataTypes.ENUM('married', 'single'),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cnic: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: 'Pakistani national identity card number',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'staff',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['cnic'],          name: 'uq_staff_cnic'          },
      { unique: true, fields: ['user_id'],       name: 'uq_staff_user_id'       },
      { unique: true, fields: ['name_initials'], name: 'uq_staff_name_initials' },
      { fields: ['user_id'],                     name: 'idx_staff_user_id'      },
    ],
  });
};

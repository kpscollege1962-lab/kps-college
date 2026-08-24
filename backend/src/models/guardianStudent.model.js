const { DataTypes } = require('sequelize');

// Domain relationship table used by CASL to scope guardian
// access to only their own children.

module.exports = (sequelize) => {
  return sequelize.define('GuardianStudent', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    guardian_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'guardians', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    is_primary: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Whether this is the primary contact guardian for this student',
    },
  }, {
    tableName: 'guardian_students',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['guardian_id', 'student_id'], name: 'uq_guardian_student' },
      {               fields: ['student_id'],                 name: 'idx_gs_student_id'   },
    ],
  });
};

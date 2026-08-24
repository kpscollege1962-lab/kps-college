const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StaffPosting', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    staff_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'staff', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'campuses', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    employee_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Campus-assigned employee number',
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    is_timetable_eligible: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: 'Whether this staff member can be assigned to timetable slots at this campus',
    },
    allow_concurrent_periods: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: 'When true, this staff member is exempt from the single-class-per-period timetable conflict check (e.g. PET teachers running drills across multiple sections at once)',
    },
  }, {
    tableName: 'staff_postings',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['campus_id', 'staff_id'], name: 'uq_posting_campus_staff' },
      { unique: true, fields: ['campus_id', 'employee_no'], name: 'uq_posting_campus_employee_no' },
      { fields: ['staff_id'], name: 'idx_posting_staff_id' },
      { fields: ['campus_id'], name: 'idx_posting_campus_id' },
    ],
  });
};

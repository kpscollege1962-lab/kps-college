const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FeeChallan', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    enrollment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'enrollments', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'campuses', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Denormalized from enrollment at creation time for fast reporting/filtering without joins',
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Denormalized from enrollment at creation time',
    },
    month: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    year: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'overdue', 'cancelled'),
      allowNull: false,
      defaultValue: 'unpaid',
    },
  }, {
    tableName: 'fee_challans',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['campus_id'], name: 'idx_challan_campus_id' },
      { fields: ['session_id'], name: 'idx_challan_session_id' },
      { fields: ['enrollment_id'], name: 'idx_challan_enrollment_id' },
      { fields: ['status'], name: 'idx_challan_status' },
      {
        unique: true,
        fields: ['enrollment_id', 'session_id', 'month', 'year'],
        name: 'uq_challan_enrollment_period',
        comment: 'Prevents duplicate challans for the same enrollment/month, safe to re-run generation',
      },
    ],
  });
};
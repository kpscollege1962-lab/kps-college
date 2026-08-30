const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FeeStructure', {
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
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Fee amounts are set once per session; a new session requires new structures (or a clone, like classes)',
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'sections', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'NULL = class-level default amount, applies to all sections. Set = override for that specific section only.',
    },
    fee_head_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'fee_heads', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    due_day: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 31 },
      comment: 'Day of month challans become due, e.g. 10 = due on the 10th of every month',
    },
  }, {
    tableName: 'fee_structures',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['campus_id'], name: 'idx_fee_structure_campus_id' },
      { fields: ['session_id'], name: 'idx_fee_structure_session_id' },
      { fields: ['class_group_id'], name: 'idx_fee_structure_class_group_id' },
      {
        unique: true,
        fields: ['session_id', 'class_group_id', 'section_id', 'fee_head_id'],
        name: 'uq_structure_session_class_section_head',
        comment: 'MySQL does not enforce NULL uniqueness — the one-class-level-default-per-fee-head invariant (section_id IS NULL) is enforced at the service layer, same pattern as Section.',
      },
    ],
  });
};
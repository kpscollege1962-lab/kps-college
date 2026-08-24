const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('ClassGroup', {
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
      comment: 'Campus this class belongs to',
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Academic session this class belongs to',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. Class 9, Grade 5 — unique per campus+session',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Numeric sort order for display ordering',
    },
    academic_level: {
      type: DataTypes.ENUM('pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'),
      allowNull: false,
      comment: 'Educational band',
    },
  }, {
    tableName: 'class_groups',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['campus_id', 'session_id', 'name'],
        name: 'uq_class_campus_session_name',
      },
    ],
  });
};

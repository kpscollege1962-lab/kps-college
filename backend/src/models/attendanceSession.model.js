const { DataTypes } = require('sequelize');

// Attendance session — the register header for one section on one date.
// One session per section per date (unique constraint).
// Status: draft = in progress, submitted = locked.
// marked_by is nullable: SET NULL if the user account is deleted; the
// session record itself must be preserved as historical data.

module.exports = (sequelize) => {
  return sequelize.define('AttendanceSession', {
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
      comment: 'Session the class belongs to, not the currently running calendar session',
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Denormalized from section for efficient reporting queries',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    marked_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'User who submitted this register. Nullable: SET NULL if user account is deleted',
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted'),
      allowNull: false,
      defaultValue: 'draft',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'attendance_sessions',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['campus_id', 'session_id', 'section_id', 'date'],
        name: 'uq_att_session_section_date',
      },
      { fields: ['campus_id', 'date'],  name: 'idx_att_session_campus_date' },
      { fields: ['class_group_id'],     name: 'idx_att_session_class_group' },
      { fields: ['section_id'],         name: 'idx_att_session_section'    },
      { fields: ['marked_by'],          name: 'idx_att_session_marked_by'  },
    ],
  });
};

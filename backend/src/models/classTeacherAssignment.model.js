const { DataTypes } = require('sequelize');

// Class teacher assignments — maps staff members to sections they are responsible for,
// scoped to campus + session. Used across modules (attendance, results, report cards,
// communications, etc.) to determine section ownership. Many-to-many: a section can
// have multiple assigned staff (e.g. substitute cover) and a staff member can be
// assigned to multiple sections.

module.exports = (sequelize) => {
  return sequelize.define('ClassTeacherAssignment', {
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
      comment: 'Campus this assignment belongs to',
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Sessions are historical records; RESTRICT prevents silent deletion of assignment history',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'If a section is deleted, its assignments are meaningless',
    },
    staff_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'staff', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'If a staff record is removed, their assignments go with them',
    },
  }, {
    tableName: 'class_teacher_assignments',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['campus_id', 'session_id', 'section_id', 'staff_id'],
        name: 'uq_cta_campus_session_section_staff',
      },
      { fields: ['staff_id'],               name: 'idx_cta_staff_id'       },
      { fields: ['campus_id', 'session_id'], name: 'idx_cta_campus_session' },
      { fields: ['section_id'],             name: 'idx_cta_section_id'    },
    ],
  });
};

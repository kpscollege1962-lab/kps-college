const { DataTypes } = require('sequelize');

// Attendance record — one line item per student per attendance session.
// student_id is used directly (not enrollment_id) because the session header
// already carries all scope context (campus, session, section).
// CASCADE from attendance_session: records are owned by their session header.
// RESTRICT on student: attendance records are historical facts about a student.

module.exports = (sequelize) => {
  return sequelize.define('AttendanceRecord', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    attendance_session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'attendance_sessions', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'Owned child — cascades when session header is deleted',
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Historical record — never cascade-delete attendance facts',
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'attendance_records',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['attendance_session_id', 'student_id'],
        name: 'uq_att_record_session_student',
      },
      { fields: ['student_id'], name: 'idx_att_record_student' },
    ],
  });
};

module.exports = ({ Campus, AcademicSession, Section, ClassGroup, Staff, ClassTeacherAssignment,
                    AttendanceSession, AttendanceRecord, User, Student }) => {
  // Campus <-> ClassTeacherAssignment
  Campus.hasMany(ClassTeacherAssignment, { foreignKey: 'campus_id', as: 'classTeacherAssignments' });
  ClassTeacherAssignment.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

  // AcademicSession <-> ClassTeacherAssignment
  AcademicSession.hasMany(ClassTeacherAssignment, { foreignKey: 'session_id', as: 'classTeacherAssignments' });
  ClassTeacherAssignment.belongsTo(AcademicSession, { foreignKey: 'session_id', as: 'session' });

  // Section <-> ClassTeacherAssignment
  Section.hasMany(ClassTeacherAssignment, { foreignKey: 'section_id', as: 'classTeacherAssignments' });
  ClassTeacherAssignment.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });

  // Staff <-> ClassTeacherAssignment
  Staff.hasMany(ClassTeacherAssignment, { foreignKey: 'staff_id', as: 'classTeacherAssignments' });
  ClassTeacherAssignment.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

  // AttendanceSession associations
  Campus.hasMany(AttendanceSession,         { foreignKey: 'campus_id',    as: 'attendanceSessions' });
  AttendanceSession.belongsTo(Campus,       { foreignKey: 'campus_id',    as: 'campus' });

  AcademicSession.hasMany(AttendanceSession,    { foreignKey: 'session_id',   as: 'attendanceSessions' });
  AttendanceSession.belongsTo(AcademicSession,  { foreignKey: 'session_id',   as: 'session' });

  ClassGroup.hasMany(AttendanceSession,     { foreignKey: 'class_group_id', as: 'attendanceSessions' });
  AttendanceSession.belongsTo(ClassGroup,   { foreignKey: 'class_group_id', as: 'classGroup' });

  Section.hasMany(AttendanceSession,        { foreignKey: 'section_id',   as: 'attendanceSessions' });
  AttendanceSession.belongsTo(Section,      { foreignKey: 'section_id',   as: 'section' });

  User.hasMany(AttendanceSession,           { foreignKey: 'marked_by',    as: 'markedAttendanceSessions' });
  AttendanceSession.belongsTo(User,         { foreignKey: 'marked_by',    as: 'markedBy' });

  // AttendanceRecord associations
  AttendanceSession.hasMany(AttendanceRecord,   { foreignKey: 'attendance_session_id', as: 'records' });
  AttendanceRecord.belongsTo(AttendanceSession, { foreignKey: 'attendance_session_id', as: 'attendanceSession' });

  Student.hasMany(AttendanceRecord,         { foreignKey: 'student_id',   as: 'attendanceRecords' });
  AttendanceRecord.belongsTo(Student,       { foreignKey: 'student_id',   as: 'student' });
};

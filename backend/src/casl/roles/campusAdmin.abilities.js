module.exports = (can, _cannot) => {
  can('manage', 'CampusSettings');
  can('manage', 'Staff');
  can('manage', 'Timetable');
  can('manage', 'ClassGroup');
  can('manage', 'ClassTeacherAssignment');
  can('manage', 'Attendance');
  can('manage', 'AttendanceReports');
};

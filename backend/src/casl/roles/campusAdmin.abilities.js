module.exports = (can, _cannot) => {
  can('manage', 'CampusSettings');
  can('manage', 'Staff');
  can('manage', 'Timetable');
  can('manage', 'Rota');      // assign / issue the daily rota (arrangement for absent teachers)
  can('manage', 'ClassGroup');
  can('manage', 'ClassTeacherAssignment');
  can('manage', 'Attendance');
  can('manage', 'AttendanceReports');
  can('manage', 'FeeHead');
  can('manage', 'FeeStructure');
  can('manage', 'FeeChallan');
  can('manage', 'FeePayment');
  // Teachers' assignments at this campus: view + proformas, edit, soft delete, restore / delete
  // permanently. Campus-scoped like every rule here (only granted at the admin's own campus).
  can(['read', 'update', 'delete', 'restore'], 'HomeworkOverview');
};
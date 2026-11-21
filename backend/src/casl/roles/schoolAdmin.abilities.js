module.exports = (can, _cannot) => {
  can('manage', 'AcademicSession');
  can('manage', 'Subject');
  can('manage', 'Student');
  can('manage', 'Enrollment');
  // Teachers' assignments: view + proformas, edit, soft delete, restore / delete permanently.
  // On HomeworkOverview (not Homework) so a teacher's `manage Homework` never passes these checks.
  can(['read', 'update', 'delete', 'restore'], 'HomeworkOverview');
};

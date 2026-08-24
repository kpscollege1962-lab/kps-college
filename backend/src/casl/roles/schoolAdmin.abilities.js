module.exports = (can, _cannot) => {
  can('manage', 'AcademicSession');
  can('manage', 'Subject');
  can('manage', 'Student');
  can('manage', 'Enrollment');
};

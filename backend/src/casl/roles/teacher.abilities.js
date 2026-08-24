module.exports = (can, _cannot) => {
  can('read',   'Attendance', { scope: 'own' });   // view their own sections' registers
  can('create', 'Attendance', { scope: 'own' });   // open a new register (draft)
  can('update', 'Attendance', { scope: 'own' });   // edit a draft register / save progress
  can('submit', 'Attendance', { scope: 'own' });   // submit a draft register (lock it)
};

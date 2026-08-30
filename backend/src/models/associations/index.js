const authAssociations       = require('./auth.associations');
const rbacAssociations       = require('./rbac.associations');
const peopleAssociations     = require('./people.associations');
const academicsAssociations  = require('./academics.associations');
const campusAssociations     = require('./campus.associations');
const timetableAssociations  = require('./timetable.associations');
const attendanceAssociations = require('./attendance.associations');
const feesAssociations       = require('./fees.associations');

module.exports = (db) => {
  authAssociations(db);
  rbacAssociations(db);
  peopleAssociations(db);
  academicsAssociations(db);
  campusAssociations(db);
  timetableAssociations(db);
  attendanceAssociations(db);
  feesAssociations(db);
};
const ROLES = Object.freeze({
  SUPER_ADMIN:     'SUPER_ADMIN',
  SCHOOL_ADMIN:    'SCHOOL_ADMIN',
  CAMPUS_ADMIN:    'CAMPUS_ADMIN',
  PRINCIPAL:       'PRINCIPAL',
  TEACHER:         'TEACHER',
  EXAM_CONTROLLER: 'EXAM_CONTROLLER',
  ACCOUNTANT:      'ACCOUNTANT',
  RECEPTIONIST:    'RECEPTIONIST',
  GUARDIAN:        'GUARDIAN',
  STUDENT:         'STUDENT',
});

const ROLE_ENTRIES = [
  { name: ROLES.SUPER_ADMIN,     label: 'Super Admin',     layer: 'global' },
  { name: ROLES.SCHOOL_ADMIN,    label: 'School Admin',    layer: 'global' },
  { name: ROLES.CAMPUS_ADMIN,    label: 'Campus Admin',    layer: 'campus' },
  { name: ROLES.PRINCIPAL,       label: 'Principal',       layer: 'campus' },
  { name: ROLES.TEACHER,         label: 'Teacher',         layer: 'campus' },
  { name: ROLES.EXAM_CONTROLLER, label: 'Exam Controller', layer: 'campus' },
  { name: ROLES.ACCOUNTANT,      label: 'Accountant',      layer: 'campus' },
  { name: ROLES.RECEPTIONIST,    label: 'Receptionist',    layer: 'campus' },
  { name: ROLES.GUARDIAN,        label: 'Guardian',        layer: 'campus' },
  { name: ROLES.STUDENT,         label: 'Student',         layer: 'campus' },
];

module.exports = { ROLES, ROLE_ENTRIES };

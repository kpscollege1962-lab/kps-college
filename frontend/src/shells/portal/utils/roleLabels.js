const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  CAMPUS_ADMIN: 'Campus Admin',
  PRINCIPAL: 'Principal',
  TEACHER: 'Teacher',
  EXAM_CONTROLLER: 'Exam Controller',
  ACCOUNTANT: 'Accountant',
  RECEPTIONIST: 'Receptionist',
  GUARDIAN: 'Guardian',
  STUDENT: 'Student',
}

export const roleLabel = (roleName) =>
  ROLE_LABELS[roleName] ??
  String(roleName ?? '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')


export const contextLabels = (context) =>
  context.layer === 'campus'
    ? { primary: context.campusName ?? `Campus #${context.campusId}`, secondary: roleLabel(context.roleName) }
    : { primary: roleLabel(context.roleName), secondary: 'All campuses' }
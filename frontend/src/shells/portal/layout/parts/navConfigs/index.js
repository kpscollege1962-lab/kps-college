import ROLES from '@/constants/roles'

import superAdminNav    from './superAdmin.nav'
import schoolAdminNav   from './schoolAdmin.nav'
import campusAdminNav   from './campusAdmin.nav'
import principalNav     from './principal.nav'
import teacherNav       from './teacher.nav'
import examControllerNav from './examController.nav'
import accountantNav    from './accountant.nav'
import receptionistNav  from './receptionist.nav'
import guardianNav      from './guardian.nav'
import studentNav       from './student.nav'

export function resolveNavConfig(activeRole) {
  switch (activeRole?.roleName) {
    case ROLES.SUPER_ADMIN:     return superAdminNav
    case ROLES.SCHOOL_ADMIN:    return schoolAdminNav
    case ROLES.CAMPUS_ADMIN:    return campusAdminNav
    case ROLES.PRINCIPAL:       return principalNav
    case ROLES.TEACHER:         return teacherNav
    case ROLES.EXAM_CONTROLLER: return examControllerNav
    case ROLES.ACCOUNTANT:      return accountantNav
    case ROLES.RECEPTIONIST:    return receptionistNav
    case ROLES.GUARDIAN:        return guardianNav
    case ROLES.STUDENT:         return studentNav
    default:                    return []
  }
}

import { useAbility } from '@casl/react'
import { AbilityContext } from '@/casl/AbilityProvider'
import ROLES from '@/constants/roles'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import AdminAttendancePage from './AdminAttendancePage'
import TeacherAttendanceHome from './TeacherAttendanceHome'

// Sidebar → Attendance. The office (Super Admin, School Admin, Campus Admin, Principal) gets the
// daily overview; a teacher is taken to the Attendance tab of the class they are form master of.
export default function AttendanceLandingPage() {
  const ability = useAbility(AbilityContext)
  const { activeRole } = useRoleContext()

  if (ability.can('read', 'AttendanceReports')) return <AdminAttendancePage />
  if (activeRole?.roleName === ROLES.TEACHER) return <TeacherAttendanceHome />
  return (
    <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
      Attendance is not available for this account yet.
    </div>
  )
}

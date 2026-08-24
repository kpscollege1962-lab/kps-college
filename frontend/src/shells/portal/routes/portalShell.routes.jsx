import AuthGuard from '@/shells/portal/guards/AuthGuard'
import ContextGuard from '@/shells/portal/guards/ContextGuard'
import PortalLayout from '@/shells/portal/layout/PortalLayout'
import RoleSelectPage from '@/shells/portal/pages/RoleSelectPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import { campusRoutes } from '@/modules/campuses/routes/campuses.routes'
import { schoolSettingsRoutes } from '@/modules/school-settings/routes/school-settings.routes'
import { campusSettingsRoutes } from '@/modules/campus-settings/routes/campus-settings.routes'
import { academicSessionRoutes } from '@/modules/academic-sessions/routes/academicSessions.routes'
import { classRoutes } from '@/modules/classes/routes/classes.routes'
import { staffRoutes } from '@/modules/staff/routes/staff.routes'
import { studentRoutes } from '@/modules/students/routes/students.routes'
import { enrollmentRoutes } from '@/modules/enrollments/routes/enrollments.routes'
import { subjectRoutes } from '@/modules/subjects/routes/subjects.routes'
import { timetableRoutes } from '@/modules/timetable/routes/timetable.routes'
import { classTeacherAssignmentRoutes } from '@/modules/class-teacher-assignments/routes/classTeacherAssignments.routes'
import { attendanceRoutes } from '@/modules/attendance/routes/attendance.routes'
import NotFoundPage from '@/app/pages/NotFoundPage'
import AbilityProvider from '@/casl/AbilityProvider'

export const portalShellRoutes = {
  path: '/portal',
  element: <AuthGuard />,         // layer 1: must be logged in
  children: [
    // Role selection — accessible after login but before a context is chosen
    { path: 'select-role', element: <RoleSelectPage /> },

    // All portal pages — require an active role context
    {
      element: (
        <AbilityProvider>
          <ContextGuard />   {/* layer 2: must have an active role context */}
        </AbilityProvider>
      ),
      children: [
        {
          element: <PortalLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: 'campuses',  children: campusRoutes },
            { path: 'settings', children: schoolSettingsRoutes },
            { path: 'campus-settings',     children: campusSettingsRoutes },
            { path: 'academic-sessions',   children: academicSessionRoutes },
            { path: 'classes',             children: classRoutes },
            { path: 'staff',               children: staffRoutes },
            { path: 'students',            children: studentRoutes },
            { path: 'enrollments',         children: enrollmentRoutes },
            { path: 'subjects',            children: subjectRoutes },
            { path: 'timetable',           children: timetableRoutes },
            { path: 'class-teacher-assignments', children: classTeacherAssignmentRoutes },
            { path: 'attendance',           children: attendanceRoutes },
            // Feature module routes will be added here as they are built
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ],
}

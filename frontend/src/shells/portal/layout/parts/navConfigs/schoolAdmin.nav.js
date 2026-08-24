import { LayoutDashboard, CalendarDays, GraduationCap, ClipboardList, BookOpen } from 'lucide-react'

const schoolAdminNav = [
  { id: 'dashboard',         title: 'Dashboard',   icon: LayoutDashboard, path: '/portal'                   },
  { id: 'students',          title: 'Students',    icon: GraduationCap,   path: '/portal/students'          },
  { id: 'enrollments',       title: 'Enrollments', icon: ClipboardList,   path: '/portal/enrollments'       },
  { id: 'academic-sessions', title: 'Sessions',    icon: CalendarDays,    path: '/portal/academic-sessions' },
  { id: 'subjects',          title: 'Subjects',    icon: BookOpen,        path: '/portal/subjects'          },
]

export default schoolAdminNav

import { LayoutDashboard, Users, CalendarDays, Layers, Settings, UserCog, ClipboardList } from 'lucide-react'

const campusAdminNav = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/portal'                },
  { id: 'staff',     title: 'Staff',     icon: Users,           path: '/portal/staff'          },
  { id: 'classes',   title: 'Classes',   icon: Layers,          path: '/portal/classes'        },
  { id: 'class-teacher-assignments', title: 'Class Teachers', icon: UserCog, path: '/portal/class-teacher-assignments' },
  { id: 'attendance', title: 'Attendance', icon: ClipboardList, path: '/portal/attendance'      },
  { id: 'timetable', title: 'Timetable', icon: CalendarDays,    path: '/portal/timetable'      },
  { id: 'settings',  title: 'Settings',  icon: Settings,        path: '/portal/campus-settings'},
]

export default campusAdminNav

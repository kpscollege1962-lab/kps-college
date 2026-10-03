import { LayoutDashboard, ClipboardList, Layers } from 'lucide-react'

const teacherNav = [
  { id: 'dashboard',  title: 'Dashboard',  icon: LayoutDashboard, path: '/portal' },
  { id: 'my-classes', title: 'My Classes', icon: Layers, path: '/portal/my-classes', dynamic: 'teachingClasses' },
  { id: 'attendance', title: 'Attendance', icon: ClipboardList, path: '/portal/attendance' },
]

export default teacherNav
import { LayoutDashboard, FileText, CalendarDays, ClipboardList, Wallet } from 'lucide-react'

const studentNav = [
  { id: 'dashboard',  title: 'Dashboard',   icon: LayoutDashboard, path: '/portal' },
  { id: 'results',    title: 'My Results',  icon: FileText,        path: '/portal/results' },
  { id: 'timetable',  title: 'Timetable',   icon: CalendarDays,    path: '/portal/timetable' },
  { id: 'attendance', title: 'Attendance',  icon: ClipboardList,   path: '/portal/attendance' },
  { id: 'fees',       title: 'My Fees',     icon: Wallet,          path: '/portal/my-fees' },
]

export default studentNav
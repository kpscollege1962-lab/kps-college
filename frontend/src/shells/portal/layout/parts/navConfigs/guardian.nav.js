import { LayoutDashboard, GraduationCap, ClipboardList, FileText, Banknote } from 'lucide-react'

const guardianNav = [
  { id: 'dashboard',   title: 'Dashboard',    icon: LayoutDashboard, path: '/portal' },
  { id: 'children',    title: 'My Children',  icon: GraduationCap,   path: '/portal/children' },
  { id: 'attendance',  title: 'Attendance',   icon: ClipboardList,   path: '/portal/attendance' },
  { id: 'results',     title: 'Results',      icon: FileText,        path: '/portal/results' },
  { id: 'fees',        title: 'Fees',         icon: Banknote,        path: '/portal/fees' },
]

export default guardianNav

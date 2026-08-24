import { LayoutDashboard, FileText, ClipboardList, GraduationCap } from 'lucide-react'

const examControllerNav = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { id: 'exams',     title: 'Exams',     icon: FileText,        path: '/portal/exams' },
  { id: 'results',   title: 'Results',   icon: ClipboardList,   path: '/portal/results' },
  { id: 'students',  title: 'Students',  icon: GraduationCap,   path: '/portal/students' },
]

export default examControllerNav

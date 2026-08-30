import { LayoutDashboard, Banknote, Receipt, GraduationCap } from 'lucide-react'

const accountantNav = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { id: 'fees',      title: 'Fees',      icon: Banknote,        path: '/portal/fees' },
  { id: 'invoices',  title: 'Invoices',  icon: Receipt,         path: '/portal/invoices' },
  { id: 'students',  title: 'Students',  icon: GraduationCap,   path: '/portal/students' },
]

export default accountantNav
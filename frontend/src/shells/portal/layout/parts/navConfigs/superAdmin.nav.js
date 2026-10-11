import { LayoutDashboard, Building2, Settings, BookOpen } from 'lucide-react'

const superAdminNav = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { id: 'campuses', title: 'Campuses', icon: Building2, path: '/portal/campuses' },
  { id: 'assignments', title: 'Assignments', icon: BookOpen, path: '/portal/assignments' },
  { id: 'settings', title: 'Settings', icon: Settings, path: '/portal/settings' },
]

export default superAdminNav

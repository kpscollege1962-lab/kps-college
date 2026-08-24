import { Link, Outlet, NavLink } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Status List',    to: '/portal/attendance/reports/status-list'    },
  { label: 'Class Register', to: '/portal/attendance/reports/class-register' },
]

export default function ReportsLayout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/portal/attendance">
          <Button variant="ghost" size="icon-sm" aria-label="Back to attendance">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Attendance Reports</h1>
      </div>

      <nav className="flex gap-1 border-b border-border">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}

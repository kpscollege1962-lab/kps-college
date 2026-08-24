import { useEffect } from 'react'
import { useParams, Link, Outlet, NavLink } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useStaffMember } from '../hooks/useStaffMember'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function StaffLayout() {
  const { staffId } = useParams()
  const { activeRole } = useRoleContext()
  const parsedStaffId  = parseInt(staffId)

  const { staff, loading, error, fetchStaff } = useStaffMember(activeRole.campusId, parsedStaffId)

  useEffect(() => {
    fetchStaff()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading && !staff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/portal/staff">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Staff
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!staff) return null

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Persistent header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/staff">
          <Button variant="ghost" size="icon-sm" aria-label="Back to staff">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            {staff.gender === 'male' ? 'Mr. ' : staff.gender === 'female' ? 'Miss. ' : ''}{staff.full_name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {staff.postings?.[0]?.employee_no
              ? `Emp No: ${staff.postings[0].employee_no}`
              : `CNIC: ${staff.cnic}`}
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="flex gap-1 border-b border-border">
        {[
          { label: 'Profile',    to: `/portal/staff/${staffId}`            },
          { label: 'Employment', to: `/portal/staff/${staffId}/employment` },
        ].map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end
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

      {/* Child route */}
      <Outlet context={{ staff, fetchStaff }} />

    </div>
  )
}

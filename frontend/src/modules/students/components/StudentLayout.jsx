import { useEffect } from 'react'
import { useParams, Link, Outlet, NavLink } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useStudent } from '../hooks/useStudent'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function StudentLayout() {
  const { studentId } = useParams()
  const parsedStudentId = parseInt(studentId)

  const { student, loading, error, fetchStudent } = useStudent(parsedStudentId)

  useEffect(() => {
    fetchStudent()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const navItems = [
    { label: 'Profile',   to: `/portal/students/${studentId}`           },
    { label: 'Registers', to: `/portal/students/${studentId}/registers` },
  ]

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading && !student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-64 rounded-md" />
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

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/portal/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!student) return null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Persistent header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/students">
          <Button variant="ghost" size="icon-sm" aria-label="Back to students">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">
           {student?.gender === 'male' ? 'Mr.' : 'Miss.'} {student.full_name}
          </h1>
          <p className="text-xs text-muted-foreground">GR No: {student.gr_no}</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="flex gap-1 border-b border-border">
        {navItems.map(({ label, to }) => (
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
      <Outlet context={{ student, fetchStudent }} />

    </div>
  )
}

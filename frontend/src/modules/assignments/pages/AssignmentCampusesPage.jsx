import { useEffect } from 'react'
import { Link } from 'react-router'
import { Building2, ChevronRight } from 'lucide-react'
import { useAbility } from '@casl/react'
import { AbilityContext } from '@/casl/AbilityProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCampusList } from '../hooks/useCampusList'

export default function AssignmentCampusesPage() {
  const ability = useAbility(AbilityContext)
  const canView = ability.can('read', 'HomeworkOverview')
  const { campuses, loading, error, fetchCampuses } = useCampusList()

  useEffect(() => {
    if (canView) fetchCampuses()
  }, [canView, fetchCampuses])

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 border border-dashed border-border rounded-2xl text-center">
        <p className="text-sm font-medium text-foreground">You don't have access to this page</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Choose a campus to view its assignments</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      )}

      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && !error && campuses.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No campuses found</p>
        </div>
      )}

      {!loading && !error && campuses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campuses.map((campus) => (
            <Link
              key={campus.id}
              to={`/portal/assignments/${campus.id}`}
              className="flex items-center justify-between gap-3 bg-card border border-border rounded-2xl px-4 py-4 hover:border-primary/50 hover:shadow-sm transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Building2 className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{campus.name}</p>
                  <p className="text-xs text-muted-foreground">View assignments</p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
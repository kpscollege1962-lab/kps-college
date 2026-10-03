import { Link } from 'react-router'
import { useEffect } from 'react'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useMyTeachingClasses } from '../hooks/useMyTeachingClasses'

const ACADEMIC_LEVEL_LABEL = {
  pre_primary: 'Pre-Primary', primary: 'Primary', middle: 'Middle',
  secondary: 'Secondary', higher_secondary: 'Higher Secondary',
}

export default function MyClassesIndexPage() {
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId
  const { classes, loading, error, fetchClasses } = useMyTeachingClasses(campusId)

  useEffect(() => {
    if (campusId) fetchClasses()
  }, [campusId, fetchClasses])

  const isEmpty = !loading && !error && classes.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading ? 'Loading…' : `${classes.length} class${classes.length !== 1 ? 'es' : ''} this session`}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      )}

      {!loading && error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">You're not assigned to any classes yet</p>
        </div>
      )}

      {!loading && !error && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link
              key={`${cls.classGroupId}-${cls.sectionId}`}
              to={`/portal/my-classes/${cls.classGroupId}/${cls.sectionId}`}
              className="flex items-center justify-between gap-3 text-left bg-card border border-border rounded-2xl px-4 py-4 hover:border-primary/50 hover:shadow-sm transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {cls.className}{cls.sectionName ? ` — ${cls.sectionName}` : ''}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {ACADEMIC_LEVEL_LABEL[cls.academicLevel] ?? cls.academicLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{cls.subjects.join(', ')}</p>
              </div>
              <Users className="size-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
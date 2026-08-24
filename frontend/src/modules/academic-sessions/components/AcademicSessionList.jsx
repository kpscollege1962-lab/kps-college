import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import AcademicSessionRow from './AcademicSessionRow'

export default function AcademicSessionList({
  sessions,
  loading,
  error,
  saving,
  transitioning,
  deleting,
  onEdit,
  onTransitionRequest,
  onDelete,
}) {
  return (
    <Card className="gap-0 py-0 divide-y divide-border rounded-2xl">

      {loading && (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
        ))
      )}

      {!loading && error && (
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      {!loading && !error && sessions.length === 0 && (
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No sessions found.
        </CardContent>
      )}

      {!loading && !error && sessions.map((session) => (
        <AcademicSessionRow
          key={session.id}
          session={session}
          onEdit={onEdit}
          onTransitionRequest={onTransitionRequest}
          onDelete={onDelete}
          saving={saving}
          transitioning={transitioning}
          deleting={deleting}
        />
      ))}

    </Card>
  )
}

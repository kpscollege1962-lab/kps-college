import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import CampusRow from './CampusRow'

export default function CampusList({
  campuses,
  loading,
  error,
  saving,
  onEdit,
}) {
  return (
    <Card className="gap-0 py-0 divide-y divide-border rounded-2xl">

      {/* Loading */}
      {loading && (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-14" />
            </div>
          </div>
        ))
      )}

      {/* Error */}
      {!loading && error && (
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      {/* Empty state */}
      {!loading && !error && campuses.length === 0 && (
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No campuses found.
        </CardContent>
      )}

      {/* Rows */}
      {!loading && !error && campuses.map((campus) => (
        <CampusRow
          key={campus.id}
          campus={campus}
          onEdit={onEdit}
          saving={saving}
        />
      ))}

    </Card>
  )
}

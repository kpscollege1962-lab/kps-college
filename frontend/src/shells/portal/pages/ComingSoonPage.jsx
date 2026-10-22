import { Link, useParams } from 'react-router'
import { Hourglass } from 'lucide-react'
import { findNavEntry } from '../layout/parts/navConfigs/masterNav'

export default function ComingSoonPage() {
  const { featureId } = useParams()
  const entry = findNavEntry(featureId)

  return (
    <div className="space-y-6">
      <div>
        {entry?.groupTitle && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{entry.groupTitle}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{entry?.title ?? 'This feature'}</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
        <Hourglass className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">This feature is yet to be implemented</p>
          <p className="text-xs text-muted-foreground">It is part of the plan and will appear here once it is ready.</p>
        </div>
        <Link to="/portal" className="text-xs text-primary hover:underline">Back to overview</Link>
      </div>
    </div>
  )
}
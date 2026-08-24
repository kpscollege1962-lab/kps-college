import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((__, j) => <Skeleton key={j} className="size-8 rounded-md" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

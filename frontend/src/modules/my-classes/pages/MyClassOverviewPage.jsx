import { Users, ClipboardList } from 'lucide-react'

export default function MyClassOverviewPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 border border-dashed border-border rounded-2xl">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="size-4" />
        <ClipboardList className="size-4" />
      </div>
      <p className="text-sm font-medium text-foreground">Select a tab above</p>
      <p className="text-xs text-muted-foreground">Choose Students or Assignments to get started.</p>
    </div>
  )
}
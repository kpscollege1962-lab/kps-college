import { Layers } from 'lucide-react'

export default function MyClassesIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-border rounded-2xl">
      <Layers className="size-8 text-muted-foreground" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">Select a class</p>
        <p className="text-xs text-muted-foreground">
          Expand "My Classes" in the sidebar to pick a class and view its students.
        </p>
      </div>
    </div>
  )
}
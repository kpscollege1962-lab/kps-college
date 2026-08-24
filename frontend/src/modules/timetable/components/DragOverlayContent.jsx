export default function DragOverlayContent({ dragData }) {
  if (!dragData) return null
  return (
    <div className="px-3 py-1.5 rounded-md border bg-card shadow-lg text-xs font-medium cursor-grabbing">
      {dragData.initials && <span className="font-mono mr-1.5">{dragData.initials}</span>}
      <span className="text-muted-foreground">{dragData.name}</span>
    </div>
  )
}

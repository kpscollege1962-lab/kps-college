import { useDraggable } from '@dnd-kit/react'
import { cn } from '@/lib/utils'

export default function DraggableChip({ id, type, name, initials, data }) {
  const { ref, isDragSource } = useDraggable({ id, data })

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs cursor-grab select-none',
        'bg-card border-border hover:bg-accent transition-colors',
        isDragSource && 'opacity-40',
      )}
    >
      {initials && (
        <span className="font-mono font-medium">{initials}</span>
      )}
      <span className="text-muted-foreground truncate max-w-[120px]">{name}</span>
    </div>
  )
}

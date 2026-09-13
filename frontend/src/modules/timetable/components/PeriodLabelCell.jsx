import { Coffee, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function PeriodLabelCell({ period, onDelete, onOpenBreaks, canManage }) {
  // Period 1 is always Assembly, not a real teaching period — labeled
  // accordingly, and every period after it shifts down by one so the first
  // real teaching period reads "P1" instead of "P2" (matches the same
  // renumbering applied in Timetable Preview).
  const displayLabel = period.period_number === 1 ? 'Assembly' : `P${period.period_number - 1}`

  return (
    <th className="group border border-border px-2 py-1.5 text-center bg-muted relative min-w-[120px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-foreground">{displayLabel}</span>
        {canManage && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => onOpenBreaks(period)}
                    className="text-muted-foreground/40 hover:text-amber-500 transition-colors"
                  >
                    <Coffee className="h-3 w-3" />
                  </button>
                }
              />
              <TooltipContent side="top" className="text-xs">Manage breaks</TooltipContent>
            </Tooltip>
            <button
              onClick={() => onDelete(period.id)}
              className="text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </th>
  )
}
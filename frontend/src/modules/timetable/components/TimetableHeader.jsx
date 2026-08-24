import { useNavigate } from 'react-router'
import { RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function TimetableHeader({
  loading, onRefresh,
  anchorTime, onAnchorChange, onAnchorBlur,
  canManage,
}) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Timetable</h1>
        <p className="text-xs text-muted-foreground">
          {loading ? 'Loading…' : 'Manage campus periods and class schedules'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {canManage && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              School starts at
            </Label>
            <Input
              type="time"
              value={anchorTime}
              onChange={(e) => onAnchorChange(e.target.value)}
              onBlur={() => {
                onAnchorBlur('full_day')
                onAnchorBlur('half_day')
              }}
              className="h-7 w-[120px] text-xs"
            />
          </div>
        )}
        <Tooltip>
          <TooltipTrigger render={
            <Button size="icon-sm" variant="ghost" onClick={() => navigate('/portal/timetable/preview')} />
          }>
            <Eye />
          </TooltipTrigger>
          <TooltipContent side="left">Preview / Print</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={
            <Button size="icon-sm" variant="ghost" onClick={onRefresh} disabled={loading} />
          }>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </TooltipTrigger>
          <TooltipContent side="left">Refresh</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

import { RefreshCw } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function CampusesHeader({ total, loading, onAddClick, onRefresh }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Campuses</h1>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'campus' : 'campuses'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Button size="icon-sm" variant="ghost" onClick={() => onRefresh()} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Refresh</TooltipContent>
        </Tooltip>
        <Can I="create" a="Campus">
          <Button size="sm" onClick={onAddClick}>
            Add Campus
          </Button>
        </Can>
      </div>
    </div>
  )
}

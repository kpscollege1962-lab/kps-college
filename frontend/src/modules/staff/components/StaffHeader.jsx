import { RefreshCw, Search } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function StaffHeader({
  total,
  loading,
  onAddClick,
  onAddExistingClick,
  onRefresh,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-foreground">Staff</h1>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'member' : 'members'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Name, CNIC, emp no…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 w-44 sm:w-64 text-sm pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-7 w-28 text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger>
            <Button size="icon-sm" variant="ghost" onClick={() => onRefresh()} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Refresh</TooltipContent>
        </Tooltip>
        <Can I="create" a="Staff">
          <Button size="sm" variant="outline" onClick={onAddExistingClick}>
            Add Existing Staff
          </Button>
          <Button size="sm" onClick={onAddClick}>
            Add New Staff
          </Button>
        </Can>
      </div>
    </div>
  )
}

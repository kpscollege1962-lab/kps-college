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
} from '@/components/ui/select'
import { REGISTER_LEVELS, REGISTER_LEVEL_LABELS } from '../constants/registerLevels'

export default function StudentsHeader({
  total,
  loading,
  onAddClick,
  onRefresh,
  search,
  onSearchChange,
  registerLevelFilter,
  onRegisterLevelFilterChange,
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-foreground">Students</h1>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'student' : 'students'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Name or GR Number"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 w-44 sm:w-64 text-sm pl-8"
          />
        </div>

        <Select value={registerLevelFilter} onValueChange={onRegisterLevelFilterChange}>
          <SelectTrigger className="h-7 text-sm w-55">
            <span>
              {registerLevelFilter ? REGISTER_LEVEL_LABELS[registerLevelFilter] : 'All Students'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Students</SelectItem>
            {REGISTER_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>{REGISTER_LEVEL_LABELS[level]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger>
            <Button size="icon-sm" variant="ghost" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Refresh</TooltipContent>
        </Tooltip>

        <Can I="create" a="Student">
          <Button size="sm" onClick={onAddClick}>
            Add Student
          </Button>
        </Can>

      </div>
    </div>
  )
}

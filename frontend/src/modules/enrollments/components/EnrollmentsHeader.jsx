import { useState } from 'react'
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

export default function EnrollmentsHeader({
  total,
  loading,
  onAddClick,
  onRefresh,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  campuses,
  campusFilter,
  onCampusFilterChange,
  classes,
  classesLoading,
  classFilter,
  onClassFilterChange,
  sections,
  sectionFilter,
  onSectionFilterChange,
  canEnroll,
}) {
  // Human-readable tooltip for why the button is disabled
  const enrollTooltip = !campusFilter
    ? 'Select a campus first'
    : !classFilter
      ? 'Select a class first'
      : sections.length > 0 && !sectionFilter
        ? 'Select a section first'
        : null  // button is enabled, no tooltip needed

  const [enrollTooltipOpen, setEnrollTooltipOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-foreground">Enrollments</h1>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'enrollment' : 'enrollments'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Name or GR Number"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 w-44 sm:w-64 text-sm pl-8"
          />
        </div>

        {/* Campus filter */}
        <Select value={campusFilter} onValueChange={onCampusFilterChange} disabled={campuses.length === 0}>
          <SelectTrigger className="h-7 text-sm w-36">
            <span>
              {campusFilter
                ? (campuses.find(c => String(c.id) === campusFilter)?.name ?? 'Campus')
                : 'All Campuses'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Campuses</SelectItem>
            {campuses.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Class filter — disabled until campus selected or while loading */}
        <Select
          value={classFilter}
          onValueChange={onClassFilterChange}
          disabled={!campusFilter || classesLoading}
        >
          <SelectTrigger className="h-7 text-sm w-36">
            <span>
              {classesLoading
                ? 'Loading…'
                : classFilter
                  ? (classes.find(c => String(c.id) === classFilter)?.name ?? 'Class')
                  : 'All Classes'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Section filter — only shown when a class is selected */}
        {classFilter && (
          <Select
            value={sectionFilter}
            onValueChange={onSectionFilterChange}
            disabled={sections.length === 0}
          >
            <SelectTrigger className="h-7 text-sm w-32">
              <span>
                {sections.length === 0
                  ? 'No Sections'
                  : sectionFilter
                    ? (sections.find(s => String(s.id) === sectionFilter)?.name ?? 'Section')
                    : 'All Sections'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sections</SelectItem>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-7 text-sm w-32">
            <span>
              {statusFilter === 'active'        ? 'Active'
               : statusFilter === 'transferred' ? 'Transferred'
               : statusFilter === 'withdrawn'   ? 'Withdrawn'
               : 'All Status'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
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

        <Can I="create" a="Enrollment">
          <Tooltip
            open={enrollTooltipOpen && !!enrollTooltip}
            onOpenChange={setEnrollTooltipOpen}
          >
            <TooltipTrigger>
              <Button size="sm" onClick={onAddClick} disabled={!canEnroll || loading}>
                Enroll Student
              </Button>
            </TooltipTrigger>
            {enrollTooltip && (
              <TooltipContent side="left">{enrollTooltip}</TooltipContent>
            )}
          </Tooltip>
        </Can>

      </div>
    </div>
  )
}

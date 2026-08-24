import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Duration inputs only — rendered per tab
function DurationInputs({ duration, setDuration }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground whitespace-nowrap">Break duration</Label>
      <Input
        type="number"
        min={0}
        max={120}
        value={duration ?? ''}
        onChange={(e) => setDuration(e.target.value === '' ? null : parseInt(e.target.value, 10))}
        placeholder="0"
        className="h-7 w-16 text-xs text-center"
      />
      <span className="text-xs text-muted-foreground">min</span>
    </div>
  )
}

// Shared class assignment row
function SlotRow({ row, position, onToggle }) {
  return (
    <button
      onClick={() => onToggle(row.classGroupId, row.sectionId)}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
        position === 'before' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        position === 'after'  && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        !position             && 'hover:bg-accent/50 text-muted-foreground',
      )}
    >
      <span>
        {row.classGroupName}
        {row.sectionName && ` ${row.sectionName}`}
      </span>
      {position && (
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] h-4 px-1',
            position === 'before' && 'border-amber-500 text-amber-600 dark:text-amber-400',
            position === 'after'  && 'border-blue-500 text-blue-600 dark:text-blue-400',
          )}
        >
          {position === 'before' ? 'Before' : 'After'}
        </Badge>
      )}
    </button>
  )
}

export default function PeriodBreaksDialog({ open, period, rows, saving, onSave, onClose }) {
  // Per-config duration state — separate for FD and HD
  const [fdDuration, setFdDuration] = useState(null)
  const [hdDuration, setHdDuration] = useState(null)

  // Single shared positions map for all class/section break assignments
  const [positions, setPositions] = useState({})

  // Initialise from period data when dialog opens
  useEffect(() => {
    if (!open || !period) return
    const fdTiming = period.timings?.find((t) => t.config === 'full_day')
    const hdTiming = period.timings?.find((t) => t.config === 'half_day')
    setFdDuration(fdTiming?.break_duration ?? null)
    setHdDuration(hdTiming?.break_duration ?? null)

    // Initialise shared positions from slot.break_position — config-independent
    const pos = {}
    for (const row of rows) {
      const slot = period.slots?.find(
        (s) => s.class_group_id === row.classGroupId && s.section_id === row.sectionId
      )
      pos[`${row.classGroupId}-${row.sectionId}`] = slot?.break_position ?? null
    }
    setPositions(pos)
  }, [open, period, rows])

  const handleToggle = (classGroupId, sectionId) => {
    const key = `${classGroupId}-${sectionId}`
    setPositions((prev) => {
      const cur = prev[key] ?? null
      return { ...prev, [key]: cur === null ? 'before' : cur === 'before' ? 'after' : null }
    })
  }

  const hasAnyBreak = !!fdDuration || !!hdDuration

  const handleSave = () => {
    const beforeSlots = []
    const afterSlots  = []
    for (const row of rows) {
      const key = `${row.classGroupId}-${row.sectionId}`
      if (positions[key] === 'before') beforeSlots.push({ classGroupId: row.classGroupId, sectionId: row.sectionId })
      if (positions[key] === 'after')  afterSlots.push({  classGroupId: row.classGroupId, sectionId: row.sectionId })
    }
    onSave({
      fdBreakDuration: fdDuration ?? null,
      hdBreakDuration: hdDuration ?? null,
      beforeSlots,
      afterSlots,
    })
  }

  if (!period) return null

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>P{period.period_number} — Break Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs for duration inputs only — class list is outside/below */}
        <Tabs defaultValue="full_day">
          <TabsList className="w-full">
            <TabsTrigger value="full_day" className="flex-1">Full Day</TabsTrigger>
            <TabsTrigger value="half_day" className="flex-1">Half Day</TabsTrigger>
          </TabsList>
          <TabsContent value="full_day" className="mt-3">
            <DurationInputs duration={fdDuration} setDuration={setFdDuration} />
          </TabsContent>
          <TabsContent value="half_day" className="mt-3">
            <DurationInputs duration={hdDuration} setDuration={setHdDuration} />
          </TabsContent>
        </Tabs>

        {/* Shared class assignment section — always below tabs */}
        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Class Assignment</p>
            {hasAnyBreak && (
              <p className="text-[11px] text-muted-foreground">
                Click: unassigned →{' '}
                <span className="text-amber-500 font-medium">Before</span> →{' '}
                <span className="text-blue-500 font-medium">After</span> →{' '}
                unassigned
              </p>
            )}
          </div>
          {!hasAnyBreak ? (
            <p className="text-[11px] text-muted-foreground px-1">
              Set break durations above to assign classes to break groups.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No enrolled sections found.
            </p>
          ) : (
            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {rows.map((row) => (
                <SlotRow
                  key={`${row.classGroupId}-${row.sectionId}`}
                  row={row}
                  position={positions[`${row.classGroupId}-${row.sectionId}`] ?? null}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

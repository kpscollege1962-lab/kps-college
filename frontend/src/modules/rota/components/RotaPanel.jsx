import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Printer, Search, Sparkles, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import { toLocalDateString, formatDate } from '@/lib/dateUtils'
import { nonWorkingReason } from '@/lib/workingDays'
import RichText from '@/modules/homework/components/RichText'
import {
  entryKey, periodsOfTeacher, busyReasons, rotaLoad, suggestFor,
} from '../utils/rotaPlanner'

const NONE = 'none'

// The editable state of a rota, built from what the server has:
//   absentIds: Set of staff ids;  entries: one per period of each absent teacher, `include`
//   false for a period the teacher is present for (part-day absence).
const draftFrom = (rota, periods, rows) => {
  const absentIds = new Set(rota?.absentStaffIds ?? [])
  const saved = new Map((rota?.entries ?? []).map((e) => [entryKey(e), e]))
  const entries = [...absentIds].flatMap((staffId) =>
    periodsOfTeacher(periods, rows, staffId).map((p) => {
      const s = saved.get(entryKey(p))
      return {
        ...p,
        include: rota?.status ? Boolean(s) : true,
        substituteStaffId: s?.substituteStaffId ?? null,
        forced: Boolean(s?.forced),
        forceReason: s?.forceReason ?? '',
      }
    }),
  )
  return { absentIds, entries }
}

// Assign Rota: the daily arrangement for absent teachers (timetable toolbar).
//   1. pick the date and the absent teachers; their periods that day are listed;
//   2. untick a period if the teacher is there for it (part-day absence);
//   3. choose a substitute per period: every teacher is listed with Free / Busy / Absent /
//      On rota; a busy one needs Force (an admin's deliberate override);
//   4. Save draft (only admins see it) or Issue Rota (in force for that date only).
export default function RotaPanel({
  date, onDateChange, rota, loading, saving, onSave, onDelete, onPrint, onClose,
  periods, rows, staffList,
}) {
  const ctxKey = `${date}|${rota?.status ?? ''}|${rota?.issuedAt ?? ''}|${(rota?.entries ?? []).length}|${periods.length}`
  const [draft, setDraft] = useState(() => draftFrom(rota, periods, rows))
  const [draftFor, setDraftFor] = useState(ctxKey)
  if (draftFor !== ctxKey) {
    setDraftFor(ctxKey)
    setDraft(draftFrom(rota, periods, rows))
  }
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const today = toLocalDateString()
  const isPast = date < today
  const readOnly = isPast
  const { absentIds, entries } = draft
  const included = entries.filter((e) => e.include)
  const ctx = { periods, rows, absentIds, entries }

  const staffName = (id) => staffList.find((s) => s.id === id)?.full_name ?? 'Teacher'

  // ── edits ──
  const toggleAbsent = (staffId) => setDraft((d) => {
    const next = new Set(d.absentIds)
    if (next.has(staffId)) {
      next.delete(staffId)
      return { absentIds: next, entries: d.entries.filter((e) => e.absentStaffId !== staffId) }
    }
    next.add(staffId)
    const added = periodsOfTeacher(periods, rows, staffId)
      .map((p) => ({ ...p, include: true, substituteStaffId: null, forced: false, forceReason: '' }))
    return { absentIds: next, entries: [...d.entries, ...added] }
  })
  const patchEntry = (key, patch) => setDraft((d) => ({
    ...d, entries: d.entries.map((e) => (entryKey(e) === key ? { ...e, ...patch } : e)),
  }))
  const suggestAll = () => setDraft((d) => {
    let list = d.entries
    for (const e of list) {
      if (!e.include || e.substituteStaffId != null) continue
      const pick = suggestFor(e, { staffList, periods, rows, absentIds: d.absentIds, entries: list })
      if (pick) list = list.map((x) => (entryKey(x) === entryKey(e) ? { ...x, substituteStaffId: pick.id, forced: false } : x))
    }
    return { ...d, entries: list }
  })

  // ── checks ──
  const problems = included.filter((e) => e.substituteStaffId != null && !e.forced &&
    busyReasons(e.substituteStaffId, e.periodId, { ...ctx, exceptKey: entryKey(e) }).length > 0)
  const notCovered = included.filter((e) => e.substituteStaffId == null)

  const save = async (status) => {
    if (problems.length) {
      toast.error('Some substitutes are busy in that period: choose another teacher or tick Force.')
      return
    }
    const result = await onSave({
      status,
      absentStaffIds: [...absentIds],
      entries: included.map((e) => ({
        periodId: e.periodId, classGroupId: e.classGroupId, sectionId: e.sectionId,
        absentStaffId: e.absentStaffId, substituteStaffId: e.substituteStaffId,
        forced: e.forced, forceReason: e.forced ? e.forceReason : null,
      })),
    })
    if (result.success) toast.success(status === 'issued' ? 'Rota issued' : 'Rota saved as draft')
    else toast.error(result.message)
  }

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase()
    return staffList
      .filter((s) => !q || s.full_name.toLowerCase().includes(q) || (s.name_initials ?? '').toLowerCase().includes(q))
      .sort((a, b) => Number(absentIds.has(b.id)) - Number(absentIds.has(a.id)) || a.full_name.localeCompare(b.full_name))
  }, [staffList, search, absentIds])

  const holiday = nonWorkingReason(date)

  return (
    <section className="space-y-4 rounded-2xl border border-amber-500/40 bg-card p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <CalendarClock className="size-5 text-amber-600" />
        <h2 className="text-lg font-semibold">Rota</h2>
        <Input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="h-8 w-40"
          aria-label="Rota date"
        />
        {rota?.status === 'issued' && (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
            Issued{rota.issuedBy ? ` by ${rota.issuedBy}` : ''}
          </Badge>
        )}
        {rota?.status === 'draft' && <Badge variant="outline">Draft (only admins see it)</Badge>}
        {readOnly && <Badge variant="outline">Past date: read only</Badge>}
        <div className="ml-auto flex items-center gap-1">
          {rota?.status && (
            <Button type="button" variant="outline" size="sm" onClick={onPrint}>
              <Printer className="mr-1.5 size-3.5" />Print
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close rota">
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {holiday && <p className="-mt-2 text-xs text-amber-600">{formatDate(date)} falls on {holiday}.</p>}

      {loading && !rota ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          {/* Absent teachers */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Absent teachers ({absentIds.size})</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teachers" className="h-8 pl-7" />
            </div>
            <div className="max-h-80 space-y-0.5 overflow-y-auto rounded-lg border border-border p-1">
              {filteredStaff.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50',
                    absentIds.has(s.id) && 'bg-destructive/10 text-destructive',
                    readOnly && 'cursor-default',
                  )}
                >
                  <Checkbox checked={absentIds.has(s.id)} onCheckedChange={() => toggleAbsent(s.id)} disabled={readOnly || saving} />
                  <span className="truncate">{s.full_name}</span>
                  {s.name_initials && <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{s.name_initials}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Their periods and substitutes */}
          <div className="min-w-0 space-y-4">
            {absentIds.size === 0 && (
              <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Tick the teachers who are absent on {formatDate(date)}. Their periods appear here to give to other teachers.
              </div>
            )}

            {[...absentIds].map((staffId) => {
              const list = entries.filter((e) => e.absentStaffId === staffId)
              const covered = list.filter((e) => e.include && e.substituteStaffId != null).length
              return (
                <div key={staffId} className="overflow-hidden rounded-xl border border-border">
                  <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
                    <span className="text-sm font-semibold">{staffName(staffId)}</span>
                    <span className="text-xs text-muted-foreground">
                      {list.filter((e) => e.include).length} period(s) · {covered} covered
                    </span>
                  </div>
                  {list.length === 0 && (
                    <p className="px-3 py-3 text-xs text-muted-foreground">No periods in the timetable for this teacher.</p>
                  )}
                  <div className="divide-y divide-border">
                    {list.map((e) => (
                      <EntryRow
                        key={entryKey(e)}
                        entry={e}
                        staffList={staffList}
                        ctx={ctx}
                        readOnly={readOnly || saving}
                        onChange={(patch) => patchEntry(entryKey(e), patch)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <p className="mr-auto text-xs text-muted-foreground">
            {problems.length > 0
              ? <span className="text-destructive">{problems.length} substitute(s) busy: choose another teacher or tick Force.</span>
              : notCovered.length > 0
                ? `${notCovered.length} period(s) not covered yet.`
                : included.length > 0 ? 'All periods covered.' : ''}
          </p>
          {rota?.status && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)} disabled={saving}>
              <Trash2 className="mr-1.5 size-3.5" />Delete rota
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={suggestAll} disabled={saving || notCovered.length === 0}>
            <Sparkles className="mr-1.5 size-3.5" />Suggest free teachers
          </Button>
          {rota?.status === 'issued' ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => save('draft')} disabled={saving}>Withdraw to draft</Button>
              <Button type="button" size="sm" onClick={() => save('issued')} disabled={saving || problems.length > 0}>
                {saving ? 'Saving…' : 'Update issued rota'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => save('draft')} disabled={saving || absentIds.size === 0}>Save draft</Button>
              <Button
                type="button" size="sm"
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => save('issued')}
                disabled={saving || absentIds.size === 0 || problems.length > 0}
              >
                {saving ? 'Saving…' : 'Issue Rota'}
              </Button>
            </>
          )}
        </div>
      )}

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this rota"
        description={`The rota for ${formatDate(date)} is removed${rota?.status === 'issued' ? ' and stops applying at once' : ''}. The timetable itself is not changed.`}
        onConfirm={async () => {
          const result = await onDelete()
          if (result.success) toast.success('Rota deleted')
          return result
        }}
        deleting={saving}
      />
    </section>
  )
}

function EntryRow({ entry, staffList, ctx, readOnly, onChange }) {
  const key = entryKey(entry)
  const reasonsFor = (staffId) => busyReasons(staffId, entry.periodId, { ...ctx, exceptKey: key })
  const chosenReasons = entry.substituteStaffId != null ? reasonsFor(entry.substituteStaffId) : []
  const optionText = (s) => {
    const reasons = reasonsFor(s.id)
    const load = rotaLoad(s.id, ctx.entries.filter((e) => entryKey(e) !== key))
    return `${s.full_name}${s.name_initials ? ` (${s.name_initials})` : ''} · ${reasons.length ? `Busy: ${reasons.join(', ')}` : 'Free'}${load ? ` · ${load} rota today` : ''}`
  }
  const candidates = staffList.filter((s) => s.id !== entry.absentStaffId)

  return (
    <div className={cn('grid items-center gap-2 px-3 py-2 sm:grid-cols-[auto_5.5rem_minmax(0,1fr)_minmax(0,18rem)]', !entry.include && 'opacity-50')}>
      <Checkbox
        checked={entry.include}
        onCheckedChange={(v) => onChange({ include: Boolean(v) })}
        disabled={readOnly}
        aria-label="Absent for this period"
        title="Untick if the teacher is present for this period"
      />
      <span className="text-xs font-medium">P{entry.periodNumber}{entry.time ? ` · ${entry.time}` : ''}</span>
      <span className="min-w-0 truncate text-sm">
        <RichText text={entry.classLabel} ordinal />
        {entry.subjectText && <span className="text-muted-foreground"> · {entry.subjectText}</span>}
      </span>
      <div className="space-y-1">
        <Select
          value={entry.substituteStaffId == null ? NONE : String(entry.substituteStaffId)}
          onValueChange={(v) => onChange({ substituteStaffId: v === NONE ? null : Number(v), forced: false, forceReason: '' })}
          disabled={readOnly || !entry.include}
        >
          <SelectTrigger className="h-8 w-full data-[size=default]:h-8">
            <SelectValue>
              {(v) => (v === NONE
                ? <span className="text-muted-foreground">Not covered</span>
                : staffList.find((s) => String(s.id) === v)?.full_name ?? 'Teacher')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Not covered</SelectItem>
            {candidates.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                <span className={cn(reasonsFor(s.id).length ? 'text-muted-foreground' : 'text-foreground')}>{optionText(s)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {entry.include && chosenReasons.length > 0 && (
          <div className="space-y-1 rounded-md bg-destructive/5 p-1.5">
            <p className="text-[11px] text-destructive">Busy: {chosenReasons.join(', ')}</p>
            <label className="flex items-center gap-1.5 text-[11px]">
              <Checkbox checked={entry.forced} onCheckedChange={(v) => onChange({ forced: Boolean(v) })} disabled={readOnly} />
              Force (assign anyway)
            </label>
            {entry.forced && (
              <Input
                value={entry.forceReason}
                onChange={(e) => onChange({ forceReason: e.target.value })}
                placeholder="Reason (optional)"
                maxLength={255}
                className="h-7 text-xs"
                disabled={readOnly}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, ListPlus, Plus, Printer, Sparkles, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'
import { toLocalDateString, formatDate } from '@/lib/dateUtils'
import { nonWorkingReason } from '@/lib/workingDays'
import RichText from '@/modules/homework/components/RichText'
import { entryKey, periodsOfTeacher, busyReasons, rotaLoad, suggestFor } from '../utils/rotaPlanner'

const NONE = 'none'

// One rota = one PAIR of rows:
//   row 1  Absent:          [absent teacher v]  [his class: period · class · subject v]
//   row 2  Takes the class: [substitute v]  (Free teachers first; choosing a Busy one forces it)
// "+" at the end of the pair adds another pair (pre-filled with the same absent teacher and his
// next period); "Add all his periods" adds pairs for the rest of his day.

let lineSeq = 0
const newLine = (patch = {}) => ({
  id: ++lineSeq, absentStaffId: null, slotKey: null, substituteStaffId: null, forceReason: '', ...patch,
})
const slotKeyOf = (e) => `${e.periodId}-${e.classGroupId}-${e.sectionId}`

// The pairs, from what the server has (one pair per covered period).
const linesFrom = (rota) => {
  const entries = rota?.entries ?? []
  const lines = entries.map((e) => newLine({
    absentStaffId: e.absentStaffId,
    slotKey: slotKeyOf(e),
    substituteStaffId: e.substituteStaffId,
    forceReason: e.forceReason ?? '',
  }))
  for (const id of rota?.absentStaffIds ?? []) {
    if (!entries.some((e) => e.absentStaffId === id)) lines.push(newLine({ absentStaffId: id }))
  }
  return lines.length ? lines : [newLine()]
}

export default function RotaPanel({
  date, onDateChange, rota, loading, saving, onSave, onDelete, onPrint, onClose,
  periods, rows, staffList,
}) {
  const ctxKey = `${date}|${rota?.status ?? ''}|${rota?.issuedAt ?? ''}|${(rota?.entries ?? []).length}`
  const [lines, setLines] = useState(() => linesFrom(rota))
  const [linesFor, setLinesFor] = useState(ctxKey)
  if (linesFor !== ctxKey) {
    setLinesFor(ctxKey)
    setLines(linesFrom(rota))
  }
  const [confirmDelete, setConfirmDelete] = useState(false)

  const readOnly = date < toLocalDateString() // a past rota is a record
  const holiday = nonWorkingReason(date)

  // ── what the lines mean ──
  const optionsFor = (absentId) => (absentId ? periodsOfTeacher(periods, rows, absentId) : [])
  const slotOf = (line) => optionsFor(line.absentStaffId).find((o) => slotKeyOf(o) === line.slotKey) ?? null
  const entryOf = (line) => {
    const slot = line.absentStaffId && line.slotKey ? slotOf(line) : null
    return slot ? { ...slot, substituteStaffId: line.substituteStaffId, include: true } : null
  }
  const complete = lines.map((l) => ({ line: l, entry: entryOf(l) })).filter((x) => x.entry)
  const entries = complete.map((x) => x.entry)
  const absentIds = new Set(lines.map((l) => l.absentStaffId).filter(Boolean))
  const ctx = { periods, rows, absentIds, entries }
  const reasonsFor = (staffId, entry) => busyReasons(staffId, entry.periodId, { ...ctx, exceptKey: entryKey(entry) })
  const usedKeys = (exceptId) => new Set(lines
    .filter((l) => l.id !== exceptId && l.slotKey)
    .map((l) => `${l.absentStaffId}|${l.slotKey}`))

  // ── edits ──
  const patch = (id, change) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...change } : l)))
  const nextFree = (absentId, ls) => {
    const used = new Set(ls.filter((l) => l.absentStaffId === absentId && l.slotKey).map((l) => l.slotKey))
    return optionsFor(absentId).find((o) => !used.has(slotKeyOf(o))) ?? null
  }
  const addAfter = (line) => setLines((ls) => {
    const next = line.absentStaffId ? nextFree(line.absentStaffId, ls) : null
    const fresh = next
      ? newLine({ absentStaffId: line.absentStaffId, slotKey: slotKeyOf(next) })
      : newLine()
    const i = ls.findIndex((l) => l.id === line.id)
    return [...ls.slice(0, i + 1), fresh, ...ls.slice(i + 1)]
  })
  const addAllPeriods = (line) => setLines((ls) => {
    const used = new Set(ls.filter((l) => l.absentStaffId === line.absentStaffId && l.slotKey).map((l) => l.slotKey))
    const rest = optionsFor(line.absentStaffId).filter((o) => !used.has(slotKeyOf(o)))
    if (!rest.length) return ls
    const [first, ...others] = rest
    const updated = ls.map((l) => (l.id === line.id && !l.slotKey ? { ...l, slotKey: slotKeyOf(first) } : l))
    const fill = line.slotKey ? rest : others
    const i = updated.findIndex((l) => l.id === line.id)
    return [
      ...updated.slice(0, i + 1),
      ...fill.map((o) => newLine({ absentStaffId: line.absentStaffId, slotKey: slotKeyOf(o) })),
      ...updated.slice(i + 1),
    ]
  })
  const remove = (line) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== line.id) : [newLine()]))
  const chooseAbsent = (line, absentId) => setLines((ls) => ls.map((l) => {
    if (l.id !== line.id) return l
    const first = nextFree(absentId, ls.filter((x) => x.id !== line.id))
    return { ...l, absentStaffId: absentId, slotKey: first ? slotKeyOf(first) : null, substituteStaffId: null, forceReason: '' }
  }))
  const suggestAll = () => setLines((ls) => {
    let current = ls
    for (const l of ls) {
      const e = entryOf(l)
      if (!e || l.substituteStaffId != null) continue
      const ents = current.map(entryOf).filter(Boolean)
      const pick = suggestFor(e, { staffList, periods, rows, absentIds, entries: ents })
      if (pick) current = current.map((x) => (x.id === l.id ? { ...x, substituteStaffId: pick.id } : x))
    }
    return current
  })

  // ── checks + save ──
  const started = (l) => l.absentStaffId || l.slotKey || l.substituteStaffId
  const incomplete = lines.filter((l) => started(l) && !entryOf(l))
  const notCovered = complete.filter((x) => x.line.substituteStaffId == null)

  const save = async (status) => {
    if (incomplete.length) {
      toast.error('Each rota needs the absent teacher and his class. Fill them in or remove that rota.')
      return
    }
    const result = await onSave({
      status,
      absentStaffIds: [...new Set(complete.map((x) => x.entry.absentStaffId))],
      entries: complete.map(({ line, entry }) => {
        const busy = line.substituteStaffId != null && reasonsFor(line.substituteStaffId, entry).length > 0
        return {
          periodId: entry.periodId, classGroupId: entry.classGroupId, sectionId: entry.sectionId,
          absentStaffId: entry.absentStaffId, substituteStaffId: line.substituteStaffId,
          forced: busy, forceReason: busy ? line.forceReason : null,
        }
      }),
    })
    if (result.success) toast.success(status === 'issued' ? 'Rota issued' : 'Rota saved as draft')
    else toast.error(result.message)
  }

  const name = (id) => staffList.find((s) => s.id === id)?.full_name ?? 'Teacher'

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
        {rota?.status === 'draft' && <Badge variant="outline">Draft (not in force yet)</Badge>}
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
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="space-y-3">
          {lines.map((line) => {
            const entry = entryOf(line)
            const options = optionsFor(line.absentStaffId)
            const taken = usedKeys(line.id)
            const freeOptions = options.filter((o) => !taken.has(`${line.absentStaffId}|${slotKeyOf(o)}`))
            const remaining = line.absentStaffId
              ? options.filter((o) => !taken.has(`${line.absentStaffId}|${slotKeyOf(o)}`) && slotKeyOf(o) !== line.slotKey).length
              : 0
            const candidates = entry ? staffList.filter((s) => s.id !== entry.absentStaffId) : []
            const free = entry ? candidates.filter((s) => reasonsFor(s.id, entry).length === 0)
              .sort((a, b) => rotaLoad(a.id, entries) - rotaLoad(b.id, entries) || a.full_name.localeCompare(b.full_name)) : []
            const busy = entry ? candidates.filter((s) => reasonsFor(s.id, entry).length > 0) : []
            const chosenReasons = entry && line.substituteStaffId != null ? reasonsFor(line.substituteStaffId, entry) : []
            const loadText = (s) => {
              const n = rotaLoad(s.id, entries.filter((e) => entryKey(e) !== (entry ? entryKey(entry) : '')))
              return n ? ` · ${n} rota today` : ''
            }

            return (
              <div key={line.id} className="flex overflow-hidden rounded-xl border border-border">
                <div className="min-w-0 flex-1 divide-y divide-border">
                  {/* Row 1: the absent teacher and his class */}
                  <div className="flex flex-wrap items-center gap-2 bg-destructive/5 px-3 py-2">
                    <span className="w-28 shrink-0 text-xs font-semibold text-destructive">Absent</span>
                    <Select
                      value={line.absentStaffId == null ? NONE : String(line.absentStaffId)}
                      onValueChange={(v) => chooseAbsent(line, v === NONE ? null : Number(v))}
                      disabled={readOnly || saving}
                    >
                      <SelectTrigger className="h-8 w-60 data-[size=default]:h-8">
                        <SelectValue>
                          {(v) => (v === NONE ? <span className="text-muted-foreground">Absent teacher</span> : name(Number(v)))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Absent teacher</SelectItem>
                        {staffList.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.full_name}{s.name_initials ? ` (${s.name_initials})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={line.slotKey ?? NONE}
                      onValueChange={(v) => patch(line.id, { slotKey: v === NONE ? null : v, substituteStaffId: null, forceReason: '' })}
                      disabled={readOnly || saving || !line.absentStaffId}
                    >
                      <SelectTrigger className="h-8 min-w-0 flex-1 sm:min-w-64 data-[size=default]:h-8">
                        <SelectValue>
                          {(v) => {
                            const o = options.find((x) => slotKeyOf(x) === v)
                            if (!o) {
                              return <span className="text-muted-foreground">
                                {line.absentStaffId && !options.length ? 'No classes in his timetable' : 'His class'}
                              </span>
                            }
                            return <span>P{o.periodNumber}{o.time ? ` · ${o.time}` : ''} · <RichText text={o.classLabel} ordinal />{o.subjectText ? ` · ${o.subjectText}` : ''}</span>
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>His class</SelectItem>
                        {freeOptions.map((o) => (
                          <SelectItem key={slotKeyOf(o)} value={slotKeyOf(o)}>
                            <span>P{o.periodNumber}{o.time ? ` · ${o.time}` : ''} · <RichText text={o.classLabel} ordinal />{o.subjectText ? ` · ${o.subjectText}` : ''}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!readOnly && remaining > 0 && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => addAllPeriods(line)} disabled={saving}>
                        <ListPlus className="mr-1 size-3.5" />Add all his periods ({remaining})
                      </Button>
                    )}
                  </div>

                  {/* Row 2: the teacher who takes the class */}
                  <div className="flex flex-wrap items-center gap-2 bg-emerald-500/5 px-3 py-2">
                    <span className="w-28 shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Takes the class</span>
                    <Select
                      value={line.substituteStaffId == null ? NONE : String(line.substituteStaffId)}
                      onValueChange={(v) => patch(line.id, { substituteStaffId: v === NONE ? null : Number(v), forceReason: '' })}
                      disabled={readOnly || saving || !entry}
                    >
                      <SelectTrigger className="h-8 w-60 data-[size=default]:h-8">
                        <SelectValue>
                          {(v) => (v === NONE
                            ? <span className="text-muted-foreground">{entry ? 'Not covered yet' : 'Choose his class first'}</span>
                            : name(Number(v)))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Not covered yet</SelectItem>
                        {free.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Free in this period</SelectLabel>
                            {free.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.full_name}{s.name_initials ? ` (${s.name_initials})` : ''}{loadText(s)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        {busy.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Busy: choosing one forces it</SelectLabel>
                            {busy.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                <span className="text-muted-foreground">
                                  {s.full_name} · {reasonsFor(s.id, entry).join(', ')}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    {chosenReasons.length > 0 && (
                      <>
                        <span className="text-xs text-destructive">Forced: {chosenReasons.join(', ')}</span>
                        <Input
                          value={line.forceReason}
                          onChange={(e) => patch(line.id, { forceReason: e.target.value })}
                          placeholder="Reason (optional)"
                          maxLength={255}
                          className="h-8 w-48 text-xs"
                          disabled={readOnly || saving}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* End of the pair: + another rota, remove this one */}
                {!readOnly && (
                  <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-l border-border px-1.5">
                    <Button type="button" variant="outline" size="icon-sm" onClick={() => addAfter(line)} disabled={saving}
                      title="Add another rota" aria-label="Add another rota">
                      <Plus className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(line)} disabled={saving}
                      title="Remove this rota" aria-label="Remove this rota" className="text-muted-foreground hover:text-destructive">
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <p className="mr-auto text-xs text-muted-foreground">
            {incomplete.length > 0
              ? <span className="text-destructive">{incomplete.length} rota(s) need the absent teacher and his class.</span>
              : notCovered.length > 0
                ? `${notCovered.length} class(es) not covered yet.`
                : complete.length > 0 ? `All ${complete.length} class(es) covered.` : ''}
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
              <Button type="button" size="sm" onClick={() => save('issued')} disabled={saving || incomplete.length > 0}>
                {saving ? 'Saving…' : 'Update issued rota'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => save('draft')} disabled={saving || complete.length === 0}>Save draft</Button>
              <Button
                type="button" size="sm"
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => save('issued')}
                disabled={saving || complete.length === 0 || incomplete.length > 0}
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

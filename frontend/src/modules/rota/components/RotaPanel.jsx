import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Plus, Printer, Sparkles, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import {
  entryKey, teachingPeriods, startTime, periodsOfTeacher, busyReasons, rotaLoad, suggestFor,
} from '../utils/rotaPlanner'

const NONE = 'none'        // not covered yet
const PRESENT = 'present'  // the teacher is in school for this period: no rota for it

let blockSeq = 0
const newBlock = (staffId = null) => ({ id: ++blockSeq, staffId })

const entriesOf = (periods, rows, staffId) =>
  periodsOfTeacher(periods, rows, staffId)
    .map((p) => ({ ...p, include: true, substituteStaffId: null, forceReason: '' }))

// The editable rota, built from what the server has:
//   blocks:  one per absent teacher, in order (staffId null = teacher not chosen yet);
//   entries: one per class of each absent teacher that day; `include` false = the teacher is
//            present for that period (part-day absence), so it is not on the rota.
const draftFrom = (rota, periods, rows) => {
  const ids = rota?.absentStaffIds ?? []
  const saved = new Map((rota?.entries ?? []).map((e) => [entryKey(e), e]))
  const entries = ids.flatMap((staffId) =>
    entriesOf(periods, rows, staffId).map((p) => {
      const s = saved.get(entryKey(p))
      return {
        ...p,
        include: rota?.status ? Boolean(s) : true,
        substituteStaffId: s?.substituteStaffId ?? null,
        forceReason: s?.forceReason ?? '',
      }
    }),
  )
  return { blocks: ids.length ? ids.map((id) => newBlock(id)) : [newBlock()], entries }
}

// Assign Rota: the daily arrangement for absent teachers (timetable toolbar). One table, one
// column per teaching period (P1, P2, ...). Each absent teacher takes two rows:
//   "Absent teacher":      [teacher v]  then his class + subject under each of his periods;
//   "Today's replacement": [teacher v]  under each of those classes (who takes it today).
// The replacement list puts free teachers first; choosing a busy one forces it (recorded).
// "+" at the end adds another absent teacher, "x" removes one.
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
  const [confirmDelete, setConfirmDelete] = useState(false)

  const readOnly = date < toLocalDateString()
  const locked = readOnly || saving
  const holiday = nonWorkingReason(date)
  const columns = teachingPeriods(periods)

  const { blocks, entries } = draft
  const absentIds = new Set(blocks.map((b) => b.staffId).filter(Boolean))
  const included = entries.filter((e) => e.include)
  const ctx = { periods, rows, absentIds, entries }
  const reasonsFor = (staffId, e) => busyReasons(staffId, e.periodId, { ...ctx, exceptKey: entryKey(e) })
  const forcedOf = (e) => (e.include && e.substituteStaffId != null ? reasonsFor(e.substituteStaffId, e) : [])

  // ── edits ──
  const chooseAbsent = (blockId, staffId) => setDraft((d) => {
    const old = d.blocks.find((b) => b.id === blockId)?.staffId
    return {
      blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, staffId } : b)),
      entries: [...d.entries.filter((e) => e.absentStaffId !== old), ...entriesOf(periods, rows, staffId)],
    }
  })
  const addBlockAfter = (blockId) => setDraft((d) => {
    const i = d.blocks.findIndex((b) => b.id === blockId)
    return { ...d, blocks: [...d.blocks.slice(0, i + 1), newBlock(), ...d.blocks.slice(i + 1)] }
  })
  const removeBlock = (blockId) => setDraft((d) => {
    const gone = d.blocks.find((b) => b.id === blockId)?.staffId
    const left = d.blocks.filter((b) => b.id !== blockId)
    return {
      blocks: left.length ? left : [newBlock()],
      entries: d.entries.filter((e) => e.absentStaffId !== gone),
    }
  })
  const patchEntry = (key, patch) => setDraft((d) => ({
    ...d, entries: d.entries.map((e) => (entryKey(e) === key ? { ...e, ...patch } : e)),
  }))
  const suggestAll = () => setDraft((d) => {
    const ids = new Set(d.blocks.map((b) => b.staffId).filter(Boolean))
    let list = d.entries
    for (const e of list) {
      if (!e.include || e.substituteStaffId != null) continue
      const pick = suggestFor(e, { staffList, periods, rows, absentIds: ids, entries: list })
      if (pick) list = list.map((x) => (entryKey(x) === entryKey(e) ? { ...x, substituteStaffId: pick.id, forceReason: '' } : x))
    }
    return { ...d, entries: list }
  })

  // ── status ──
  const notCovered = included.filter((e) => e.substituteStaffId == null)
  const forced = included.filter((e) => forcedOf(e).length > 0)

  const save = async (status) => {
    const result = await onSave({
      status,
      absentStaffIds: [...absentIds],
      entries: included.map((e) => {
        const isForced = forcedOf(e).length > 0
        return {
          periodId: e.periodId, classGroupId: e.classGroupId, sectionId: e.sectionId,
          absentStaffId: e.absentStaffId, substituteStaffId: e.substituteStaffId,
          forced: isForced, forceReason: isForced ? e.forceReason : null,
        }
      }),
    })
    if (result.success) toast.success(status === 'issued' ? 'Rota issued' : 'Rota saved as draft')
    else toast.error(result.message)
  }

  const cellBase = 'border-b border-r border-border px-1.5 py-1.5 align-top'
  const firstCol = 'sticky left-0 z-10 w-44 min-w-44 bg-card border-b border-r border-border px-1.5 py-1.5 align-top'
  const rowLabel = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'
  const trigger = 'h-7 w-full px-2 text-xs data-[size=default]:h-7'

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
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
      ) : columns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          This campus has no teaching periods in the timetable yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border-l border-t border-border">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className={cn(firstCol, 'bg-muted text-left text-xs font-semibold')}>Teacher</th>
                {columns.map((p) => (
                  <th key={p.id} className={cn(cellBase, 'min-w-32 text-center text-xs font-semibold')}>
                    P{p.period_number}
                    {startTime(p) && <span className="block text-[10px] font-normal text-muted-foreground">{startTime(p)}</span>}
                  </th>
                ))}
                <th className={cn(cellBase, 'w-9')} aria-label="Add or remove" />
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => {
                const mine = entries.filter((e) => e.absentStaffId === block.staffId)
                const inPeriod = (periodId) => mine.filter((e) => e.periodId === periodId)
                const takenElsewhere = new Set(blocks.filter((b) => b.id !== block.id && b.staffId).map((b) => b.staffId))
                const onRota = mine.filter((e) => e.include)
                const covered = onRota.filter((e) => e.substituteStaffId != null).length
                return [
                  /* Row 1: the absent teacher and his classes */
                  <tr key={`${block.id}-absent`}>
                    <td className={firstCol}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className={rowLabel}>Absent teacher</span>
                        {block.staffId != null && (
                          <span className="text-[10px] text-muted-foreground">
                            {mine.length === 0 ? 'no classes' : `${covered}/${onRota.length} covered`}
                          </span>
                        )}
                      </div>
                      <Select
                        value={block.staffId == null ? NONE : String(block.staffId)}
                        onValueChange={(v) => v !== NONE && chooseAbsent(block.id, Number(v))}
                        disabled={locked}
                      >
                        <SelectTrigger className={trigger}>
                          <SelectValue>
                            {(v) => (v === NONE
                              ? <span className="text-muted-foreground">Select teacher</span>
                              : <span className="truncate">{staffList.find((s) => String(s.id) === v)?.full_name ?? 'Teacher'}</span>)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {staffList.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)} disabled={takenElsewhere.has(s.id)}>
                              {s.full_name}{takenElsewhere.has(s.id) ? ' (already listed)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    {columns.map((p) => (
                      <td key={p.id} className={cn(cellBase, 'text-center align-middle')}>
                        {inPeriod(p.id).map((e) => (
                          <div key={entryKey(e)} className={cn('text-sm leading-tight', !e.include && 'opacity-40')}>
                            <span className="font-medium"><RichText text={e.classLabel} ordinal /></span>
                            {e.subjectText && <span className="block text-[11px] text-muted-foreground">{e.subjectText}</span>}
                          </div>
                        ))}
                      </td>
                    ))}
                    <td rowSpan={2} className={cn(cellBase, 'align-middle')}>
                      {!readOnly && (
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            type="button" variant="outline" size="icon-sm"
                            onClick={() => addBlockAfter(block.id)} disabled={saving}
                            title="Add another absent teacher" aria-label="Add another absent teacher"
                          >
                            <Plus className="size-4" />
                          </Button>
                          <Button
                            type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeBlock(block.id)} disabled={saving}
                            title="Remove this teacher from the rota" aria-label="Remove this teacher from the rota"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>,

                  /* Row 2: who takes each of those classes today */
                  <tr key={`${block.id}-cover`}>
                    <td className={firstCol}>
                      <div className={cn(rowLabel, 'flex h-7 items-center')}>Today&apos;s replacement</div>
                    </td>
                    {columns.map((p) => {
                      const list = inPeriod(p.id)
                      return (
                        <td key={p.id} className={cellBase}>
                          <div className="space-y-1.5">
                            {list.map((e) => (
                              <ReplacementPicker
                                key={entryKey(e)}
                                entry={e}
                                showClass={list.length > 1}
                                staffList={staffList}
                                reasonsFor={(staffId) => reasonsFor(staffId, e)}
                                load={(staffId) => rotaLoad(staffId, entries.filter((x) => entryKey(x) !== entryKey(e)))}
                                disabled={locked}
                                triggerClass={trigger}
                                onChange={(patch) => patchEntry(entryKey(e), patch)}
                              />
                            ))}
                          </div>
                        </td>
                      )
                    })}
                  </tr>,
                ]
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <p className="mr-auto text-xs text-muted-foreground">
            {absentIds.size === 0
              ? 'Select the absent teacher: his classes appear under each period, then choose who takes them.'
              : [
                  notCovered.length > 0 ? `${notCovered.length} period(s) not covered yet.` : included.length > 0 ? 'All periods covered.' : '',
                  forced.length > 0 ? `${forced.length} forced (teacher busy).` : '',
                ].filter(Boolean).join(' ')}
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
              <Button type="button" size="sm" onClick={() => save('issued')} disabled={saving}>
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
                disabled={saving || absentIds.size === 0}
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

// The "Today's replacement" select for one class: Not covered / Teacher present, then free
// teachers (fewest rota periods today first), then busy ones (choosing one forces it).
function ReplacementPicker({ entry, showClass, staffList, reasonsFor, load, disabled, triggerClass, onChange }) {
  const candidates = staffList.filter((s) => s.id !== entry.absentStaffId)
  const withReasons = candidates.map((s) => ({ s, reasons: reasonsFor(s.id) }))
  const free = withReasons.filter((x) => x.reasons.length === 0)
    .map((x) => ({ ...x, load: load(x.s.id) }))
    .sort((a, b) => a.load - b.load || a.s.full_name.localeCompare(b.s.full_name))
  const busy = withReasons.filter((x) => x.reasons.length > 0)
  const chosenReasons = entry.include && entry.substituteStaffId != null ? reasonsFor(entry.substituteStaffId) : []

  const value = !entry.include ? PRESENT : entry.substituteStaffId == null ? NONE : String(entry.substituteStaffId)
  const choose = (v) => {
    if (v === PRESENT) onChange({ include: false, substituteStaffId: null, forceReason: '' })
    else if (v === NONE) onChange({ include: true, substituteStaffId: null, forceReason: '' })
    else onChange({ include: true, substituteStaffId: Number(v), forceReason: '' })
  }

  return (
    <div className="space-y-0.5">
      {showClass && (
        <p className="text-[10px] font-medium leading-tight text-muted-foreground"><RichText text={entry.classLabel} ordinal /></p>
      )}
      <Select value={value} onValueChange={choose} disabled={disabled}>
        <SelectTrigger
          className={cn(triggerClass, chosenReasons.length > 0 && 'border-amber-500')}
          aria-label={`Replacement for ${entry.classLabel}`}
        >
          <SelectValue>
            {(v) => (v === NONE
              ? <span className="text-muted-foreground">Select teacher</span>
              : v === PRESENT
                ? <span className="text-muted-foreground">Teacher present</span>
                : <span className="truncate">{staffList.find((s) => String(s.id) === v)?.full_name ?? 'Teacher'}</span>)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Not covered yet</SelectItem>
          <SelectItem value={PRESENT}>Teacher present (no rota)</SelectItem>
          {free.length > 0 && (
            <SelectGroup>
              <SelectLabel>Free in this period</SelectLabel>
              {free.map(({ s, load: n }) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <span>{s.full_name}{n ? ` · ${n} rota today` : ''}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {busy.length > 0 && (
            <SelectGroup>
              <SelectLabel>Busy: choosing one forces it</SelectLabel>
              {busy.map(({ s, reasons }) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <span className="text-muted-foreground">{s.full_name} · {reasons.join(', ')}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      {chosenReasons.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] leading-tight text-amber-700 dark:text-amber-400">Forced: {chosenReasons.join(', ')}</p>
          <Input
            value={entry.forceReason}
            onChange={(e) => onChange({ forceReason: e.target.value })}
            placeholder="Reason (optional)"
            maxLength={255}
            className="h-7 text-xs"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

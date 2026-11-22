import { cn } from '@/lib/utils'
import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'
import { classLabelOf } from '../utils/rotaPlanner'

const shortDate = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

const initialsOf = (s) => s?.name_initials || s?.full_name || '—'

// Rows under the timetable grid for one day's rota: a title row, then one row per absent
// teacher; each period column shows the class they would have taught and who takes it.
// Rendered inside the grid's <tbody>, so the columns line up with the periods above.
export default function RotaRows({ rota, periods, rows, staffList, trailingCell }) {
  if (!rota?.status || !(rota.absentStaffIds?.length)) return null
  const staff = (id) => staffList.find((s) => s.id === id)
  const issued = rota.status === 'issued'

  return (
    <>
      <tr>
        <td
          colSpan={periods.length + 1 + (trailingCell ? 1 : 0)}
          className={cn(
            'sticky left-0 border border-border px-3 py-1.5 text-xs font-semibold',
            issued ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'bg-muted text-muted-foreground',
          )}
        >
          Rota · {shortDate(rota.date)} · {issued ? 'Issued' : 'Draft (not in force yet)'}
        </td>
      </tr>
      {rota.absentStaffIds.map((absentId) => (
        <tr key={absentId}>
          <td className="sticky left-0 z-10 whitespace-nowrap border border-border bg-amber-50 px-3 py-2 text-xs font-medium dark:bg-amber-950/40">
            <span className="text-muted-foreground">Absent: </span>{staff(absentId)?.full_name ?? 'Teacher'}
          </td>
          {periods.map((period) => {
            const here = (rota.entries ?? []).filter((e) => e.absentStaffId === absentId && e.periodId === period.id)
            return (
              <td key={period.id} className={cn('border border-border p-1.5 align-top text-xs', period.is_assembly && 'bg-muted/60')}>
                {here.map((e) => (
                  <div key={`${e.classGroupId}-${e.sectionId}`} className="leading-tight">
                    <RichText text={classLabelOf(rows, e.classGroupId, e.sectionId)} ordinal />
                    {' → '}
                    {e.substituteStaffId
                      ? <span className="font-semibold">{initialsOf(staff(e.substituteStaffId))}</span>
                      : <span className="font-semibold text-destructive">not covered</span>}
                    {e.forced && <span className="ml-1 text-[9px] text-destructive" title={e.forceReason || 'Forced'}>(forced)</span>}
                  </div>
                ))}
              </td>
            )
          })}
          {trailingCell && <td className="border border-border" />}
        </tr>
      ))}
    </>
  )
}

import { parseLocalDate } from '@/lib/dateUtils'
import RichText from '@/modules/homework/components/RichText'
import { classLabelOf, startTime } from '../utils/rotaPlanner'

const longDate = (d) =>
  parseLocalDate(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// The printed rota (notice board): campus letterhead, the date, then one line per covered
// period in timetable order, with a column for the substitute's signature.
export default function RotaSheet({ rota, periods, rows, staffList, titleUrl, footerText }) {
  const name = (id) => staffList.find((s) => s.id === id)?.full_name ?? '—'
  const periodOf = (id) => periods.find((p) => p.id === id)
  const lines = [...(rota?.entries ?? [])].sort((a, b) =>
    (periodOf(a.periodId)?.period_number ?? 0) - (periodOf(b.periodId)?.period_number ?? 0) ||
    classLabelOf(rows, a.classGroupId, a.sectionId).localeCompare(classLabelOf(rows, b.classGroupId, b.sectionId), undefined, { numeric: true }))

  const subjectOf = (e) => {
    const slot = periodOf(e.periodId)?.slots?.find((s) => s.class_group_id === e.classGroupId && s.section_id === e.sectionId)
    if (!slot) return ''
    const mine = []
    if (slot.staff_id_1 === e.absentStaffId && slot.subject1) mine.push(slot.subject1.name)
    if (slot.staff_id_2 === e.absentStaffId && slot.subject2) mine.push(slot.subject2.name)
    return mine.join(' / ') || slot.label || ''
  }

  return (
    <div className="sheet-page bg-white p-[12mm] text-black" style={{ width: '210mm' }}>
      {titleUrl && <img src={titleUrl} alt="" className="mb-3 w-full object-contain" />}
      <h1 className="text-center text-xl font-bold uppercase tracking-wide">Rota (Arrangement)</h1>
      <p className="mb-4 text-center text-sm font-semibold">{rota?.date ? longDate(rota.date) : ''}</p>

      <p className="mb-2 text-sm">
        <span className="font-semibold">Absent: </span>
        {(rota?.absentStaffIds ?? []).map(name).join(', ') || '—'}
      </p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {['Period', 'Time', 'Class', 'Subject', 'Absent teacher', 'Substitute', 'Signature'].map((h) => (
              <th key={h} className="border border-black px-2 py-1.5 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((e) => {
            const period = periodOf(e.periodId)
            return (
              <tr key={`${e.periodId}-${e.classGroupId}-${e.sectionId}-${e.absentStaffId}`}>
                <td className="border border-black px-2 py-1.5">P{period?.period_number}</td>
                <td className="border border-black px-2 py-1.5">{startTime(period) ?? ''}</td>
                <td className="border border-black px-2 py-1.5"><RichText text={classLabelOf(rows, e.classGroupId, e.sectionId)} ordinal /></td>
                <td className="border border-black px-2 py-1.5">{subjectOf(e)}</td>
                <td className="border border-black px-2 py-1.5">{name(e.absentStaffId)}</td>
                <td className="border border-black px-2 py-1.5 font-semibold">
                  {e.substituteStaffId ? name(e.substituteStaffId) : 'Not covered'}
                </td>
                <td className="w-28 border border-black px-2 py-1.5" />
              </tr>
            )
          })}
          {lines.length === 0 && (
            <tr><td colSpan={7} className="border border-black px-2 py-4 text-center">No periods on this rota.</td></tr>
          )}
        </tbody>
      </table>

      {footerText && (
        <div className="mt-10 flex justify-end">
          <div className="text-xs font-medium" style={{ whiteSpace: 'pre-line' }}>{footerText}</div>
        </div>
      )}
    </div>
  )
}

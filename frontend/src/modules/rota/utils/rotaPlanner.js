import { classLabelText } from '@/modules/homework/utils/labels'

// Pure helpers for planning a rota from the loaded timetable.
//   periods: [{ id, period_number, is_assembly, timings, slots: [{ class_group_id, section_id,
//              staff_id_1, staff_id_2, subject1, subject2, label }] }]
//   rows:    [{ classGroupId, classGroupName, sectionId, sectionName }]
//   entries: [{ periodId, classGroupId, sectionId, absentStaffId, substituteStaffId, forced, forceReason, include }]

export const entryKey = (e) => `${e.periodId}-${e.classGroupId}-${e.sectionId}-${e.absentStaffId}`

export const teachingPeriods = (periods) =>
  [...periods].filter((p) => !p.is_assembly).sort((a, b) => a.period_number - b.period_number)

export const startTime = (period) => {
  const t = period?.timings?.find((x) => x.config === 'full_day')?.start_time
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}`
}

export const classLabelOf = (rows, classGroupId, sectionId) => {
  const row = rows.find((r) => r.classGroupId === classGroupId && r.sectionId === sectionId)
  return row ? classLabelText(row.classGroupName, row.sectionName) : 'Class'
}

// Subjects a teacher takes in a slot (same rule as the server: a shared slot with one teacher
// gives them both subjects).
const subjectsOf = (slot, staffId) => {
  const out = []
  if (slot.staff_id_1 === staffId) {
    if (slot.subject1) out.push(slot.subject1)
    if (slot.staff_id_2 == null && slot.subject2) out.push(slot.subject2)
  }
  if (slot.staff_id_2 === staffId) {
    if (slot.subject2) out.push(slot.subject2)
    if (slot.staff_id_1 == null && slot.subject1) out.push(slot.subject1)
  }
  return out
}

// A teacher's periods (teaching periods only) in timetable order.
export const periodsOfTeacher = (periods, rows, staffId) =>
  teachingPeriods(periods).flatMap((period) =>
    (period.slots ?? [])
      .filter((s) => s.staff_id_1 === staffId || s.staff_id_2 === staffId)
      .map((slot) => ({
        periodId: period.id,
        periodNumber: period.period_number,
        time: startTime(period),
        classGroupId: slot.class_group_id,
        sectionId: slot.section_id,
        absentStaffId: staffId,
        classLabel: classLabelOf(rows, slot.class_group_id, slot.section_id),
        subjectText: subjectsOf(slot, staffId).map((s) => s.name).join(' / ') || slot.label || '',
      })),
  )

// Why a teacher cannot simply take `periodId` (empty list = free).
export const busyReasons = (staffId, periodId, { periods, rows, absentIds, entries, exceptKey }) => {
  const reasons = []
  if (absentIds.has(staffId)) reasons.push('absent')
  const period = periods.find((p) => p.id === periodId)
  const own = (period?.slots ?? []).find((s) => s.staff_id_1 === staffId || s.staff_id_2 === staffId)
  if (own) reasons.push(`own class ${classLabelOf(rows, own.class_group_id, own.section_id)}`)
  const other = entries.find((e) =>
    e.include !== false && e.substituteStaffId === staffId && e.periodId === periodId && entryKey(e) !== exceptKey)
  if (other) reasons.push(`rota: ${classLabelOf(rows, other.classGroupId, other.sectionId)}`)
  return reasons
}

// How many rota periods a teacher already takes in this rota.
export const rotaLoad = (staffId, entries) =>
  entries.filter((e) => e.include !== false && e.substituteStaffId === staffId).length

// The free teacher with the fewest rota periods so far (ties: alphabetical), or null.
export const suggestFor = (entry, { staffList, ...ctx }) => {
  const key = entryKey(entry)
  const candidates = staffList
    .filter((s) => s.id !== entry.absentStaffId)
    .filter((s) => busyReasons(s.id, entry.periodId, { ...ctx, exceptKey: key }).length === 0)
    .map((s) => ({ s, load: rotaLoad(s.id, ctx.entries) }))
    .sort((a, b) => a.load - b.load || a.s.full_name.localeCompare(b.s.full_name))
  return candidates[0]?.s ?? null
}

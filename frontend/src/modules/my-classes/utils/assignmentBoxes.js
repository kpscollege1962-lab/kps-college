import { classLabelText } from '@/modules/homework/utils/labels'

const cmpText = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true })

// One box = the classwork + homework for one class, subject and pair of dates.
// byTeacher: also split by teacher (admin screens list everyone's work, so two teachers'
// posts for the same class + subject + dates must never share a box).
export const groupAssignmentBoxes = (assignments, { byTeacher = false } = {}) => {
  const byKey = new Map()

  for (const a of assignments) {
    const base = `${a.class_group_id}-${a.section_id}-${a.subject_id}-${a.assigned_date}-${a.due_date}`
    const key = byTeacher ? `${base}-${a.staff_id}` : base
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        staffId: a.staff_id,
        teacherName: a.postedBy?.full_name ?? '',
        classGroupId: a.class_group_id,
        sectionId: a.section_id,
        subjectId: a.subject_id,
        subjectName: a.subject?.name ?? '',
        classLabel: classLabelText(a.classGroup?.name, a.section?.name),
        level: a.classGroup?.level ?? 0,
        assignedDate: a.assigned_date,
        dueDate: a.due_date,
        records: { classwork: [], homework: [] },
      })
    }
    const list = byKey.get(key).records[a.type]
    if (list) list.push(a)
  }

  return [...byKey.values()].sort(
    (x, y) =>
      cmpText(y.assignedDate, x.assignedDate) ||
      cmpText(y.dueDate, x.dueDate) ||
      x.level - y.level ||
      cmpText(x.classLabel, y.classLabel) ||
      cmpText(x.subjectName, y.subjectName)
  )
}

export const joinRecordTexts = (records) =>
  records.map((r) => (r.description ?? '').trim()).join('\n').trim()
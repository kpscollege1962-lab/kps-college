import { classLabelText } from '@/modules/homework/utils/labels'

const cmpText = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true })

export const groupAssignmentBoxes = (assignments) => {
  const byKey = new Map()

  for (const a of assignments) {
    const key = `${a.class_group_id}-${a.section_id}-${a.subject_id}-${a.assigned_date}-${a.due_date}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
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
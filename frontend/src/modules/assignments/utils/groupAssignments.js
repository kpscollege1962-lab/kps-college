import { classLabelText } from '@/modules/homework/utils/labels'

const classLabelOf = classLabelText
// Flat (class, section, subject, teacher) rows -> the { classGroupId, sectionId, className,
// sectionName, subjects } shape that HomeworkSheet expects.
export const tuplesToClasses = (tuples) => {
  const byClass = new Map()
  for (const t of tuples) {
    const key = `${t.classGroupId}-${t.sectionId}`
    if (!byClass.has(key)) {
      byClass.set(key, {
        classGroupId: t.classGroupId,
        sectionId: t.sectionId,
        className: t.className,
        sectionName: t.sectionName ?? null,
        level: t.level ?? 0,
        subjectsById: new Map(),
      })
    }
    byClass.get(key).subjectsById.set(t.subjectId, t.subjectName)
  }

  return [...byClass.values()]
    .map(({ subjectsById, ...rest }) => ({
      ...rest,
      subjects: [...subjectsById.entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.level - b.level || (a.sectionName ?? '').localeCompare(b.sectionName ?? ''))
}

// An assignment expressed as a structure row, so work posted outside the timetable still counts.
const assignmentToTuple = (a) => ({
  classGroupId: a.class_group_id,
  className: a.classGroup?.name ?? '',
  level: a.classGroup?.level ?? 0,
  sectionId: a.section_id,
  sectionName: a.section?.name ?? null,
  subjectId: a.subject_id,
  subjectName: a.subject?.name ?? '',
  staffId: a.staff_id,
  staffName: a.postedBy?.full_name ?? null,
})

const VIEW_CONFIG = {
  teacher: {
    keyOf: (t) => (t.staffId ? String(t.staffId) : null),
    labelOf: (t) => t.staffName ?? 'Unknown teacher',
    matchesAssignment: (a, key) => String(a.staff_id) === key,
    sort: (a, b) => a.label.localeCompare(b.label),
  },
  subject: {
    keyOf: (t) => String(t.subjectId),
    labelOf: (t) => t.subjectName,
    matchesAssignment: (a, key) => String(a.subject_id) === key,
    sort: (a, b) => a.label.localeCompare(b.label),
  },
  class: {
    keyOf: (t) => `${t.classGroupId}-${t.sectionId}`,
    labelOf: (t) => classLabelOf(t.className, t.sectionName),
    matchesAssignment: (a, key) => `${a.class_group_id}-${a.section_id}` === key,
    sort: (a, b) => a.level - b.level || a.label.localeCompare(b.label),
  },
}

// view: 'teacher' | 'subject' | 'class'
// Returns [{ key, label, level, assignments, classes }] — `classes` are the boxes for that group's report.
export const buildGroups = (view, structure, assignments) => {
  const config = VIEW_CONFIG[view]
  const tuples = [...structure, ...assignments.map(assignmentToTuple)]

  const byKey = new Map()
  for (const t of tuples) {
    const key = config.keyOf(t)
    if (key === null) continue
    if (!byKey.has(key)) byKey.set(key, { key, label: config.labelOf(t), level: t.level ?? 0, tuples: [] })
    byKey.get(key).tuples.push(t)
  }

  return [...byKey.values()]
    .map((group) => ({
      key: group.key,
      label: group.label,
      level: group.level,
      assignments: assignments.filter((a) => config.matchesAssignment(a, group.key)),
      classes: tuplesToClasses(group.tuples),
    }))
    .sort(config.sort)
}
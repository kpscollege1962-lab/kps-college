import { classLabelText, joinParts } from './labels'

const cmp = (a, b) => String(a ?? '').localeCompare(String(b ?? ''))
const classOf = (a) => classLabelText(a.classGroup?.name, a.section?.name)

// Each report type repeats one thing in the header, so the boxes show the rest:
//   teacher report -> class + subject
//   subject report -> class + teacher
//   class report   -> subject + teacher
const VIEWS = {
  teacher: {
    key: (a) => `${a.class_group_id}-${a.section_id}-${a.subject_id}`,
    title: (a) => joinParts(classOf(a), a.subject?.name),
    order: (x, y) => x.level - y.level || cmp(x.section, y.section) || cmp(x.subject, y.subject),
  },
  subject: {
    key: (a) => `${a.class_group_id}-${a.section_id}-${a.staff_id}`,
    title: (a) => joinParts(classOf(a), a.postedBy?.full_name),
    order: (x, y) => x.level - y.level || cmp(x.section, y.section) || cmp(x.teacher, y.teacher),
  },
  class: {
    key: (a) => `${a.subject_id}-${a.staff_id}`,
    title: (a) => joinParts(a.subject?.name, a.postedBy?.full_name),
    order: (x, y) => cmp(x.subject, y.subject) || cmp(x.teacher, y.teacher),
  },
}

// Boxes come straight from the assignments, so a subject with no work never gets a box.
export const buildSheetBoxes = (view, assignments) => {
  const config = VIEWS[view] ?? VIEWS.teacher
  const byKey = new Map()

  for (const a of assignments) {
    const key = config.key(a)
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        title: config.title(a),
        level: a.classGroup?.level ?? 0,
        section: a.section?.name ?? '',
        subject: a.subject?.name ?? '',
        teacher: a.postedBy?.full_name ?? '',
        classwork: [],
        homework: [],
      })
    }
    const box = byKey.get(key)
    if (a.type === 'classwork') box.classwork.push(a)
    else box.homework.push(a)
  }

  return [...byKey.values()].sort(config.order)
}
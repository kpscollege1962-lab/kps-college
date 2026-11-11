import { classLabelText } from '@/modules/homework/utils/labels'
import { periodTitle } from '@/modules/timetable/utils/periodLabel'

const cmpText = (a, b) => String(a ?? '').localeCompare(String(b ?? ''))

export const buildCards = (entries) =>
  entries
    .map((e) => ({
      key: e.slotId,
      periodName: periodTitle(e.isAssembly, e.periodNumber),
      classGroupId: e.classGroupId,
      sectionId: e.sectionId,
      classLabel: classLabelText(e.className, e.sectionName),
      subjectText: e.subjects.map((s) => s.name).join(' / ') || e.label || '',
      timings: e.timings,
    }))
    .sort((a, b) => a.periodNumber - b.periodNumber || cmpText(a.classLabel, b.classLabel))

export const buildTargets = (entries) => {
  const byKey = new Map()
  for (const e of entries) {
    for (const s of e.subjects) {
      const key = `${e.classGroupId}-${e.sectionId}-${s.id}`
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          classGroupId: e.classGroupId,
          sectionId: e.sectionId,
          subjectId: s.id,
          level: e.level ?? 0,
          classLabel: classLabelText(e.className, e.sectionName),
          subjectName: s.name,
        })
      }
    }
  }
  return [...byKey.values()].sort(
    (a, b) => a.level - b.level || cmpText(a.classLabel, b.classLabel) || cmpText(a.subjectName, b.subjectName)
  )
}

export const buildClasses = (entries) => {
  const byKey = new Map()
  for (const e of entries) {
    const key = `${e.classGroupId}-${e.sectionId}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        classGroupId: e.classGroupId,
        sectionId: e.sectionId,
        className: e.className,
        level: e.level,
        sectionName: e.sectionName,
        subjects: new Map(),
      })
    }
    for (const s of e.subjects) byKey.get(key).subjects.set(s.id, s.name)
  }
  return [...byKey.values()].map(({ subjects, ...rest }) => ({
    ...rest,
    subjects: [...subjects].map(([id, name]) => ({ id, name })),
  }))
}
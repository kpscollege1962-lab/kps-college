import { useEffect, useMemo, useState } from 'react'
import { listHomeworkService } from '../services/homework.service'
import SheetReportDialog from './SheetReportDialog'

export default function HomeworkReportDialog({
  open, onOpenChange, campusId, sessionId, classes = [], fallbackTeacherName = '',
}) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  useEffect(() => {
    if (!open) { setLoading(true); return }
    if (!campusId || !sessionId) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)
    listHomeworkService(campusId, { sessionId, mine: true, limit: 100 }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (result.success) setAssignments(result.data.data)
      else setError(result.message)
    })
    return () => { cancelled = true }
  }, [open, campusId, sessionId])

  const enriched = useMemo(() => {
    const byKey = new Map(classes.map((c) => [`${c.classGroupId}-${c.sectionId}`, c]))
    return assignments.map((a) => {
      const c = byKey.get(`${a.class_group_id}-${a.section_id}`)
      return {
        ...a,
        classGroup: { name: c?.className ?? '', level: c?.level ?? 0 },
        section: { name: c?.sectionName ?? null },
      }
    })
  }, [assignments, classes])

  const label = assignments[0]?.postedBy?.full_name ?? fallbackTeacherName

  return (
    <SheetReportDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate Report"
      label={label}
      view="teacher"
      assignments={enriched}
      loading={loading}
      error={error}
    />
  )
}
import { useCallback, useRef, useState } from 'react'
import { updateHomeworkService, deleteHomeworkService } from '@/modules/homework/services/homework.service'
import { listMyAssignmentsService, createAssignmentBatchService } from '../services/teacherWorkspace.service'
import { joinRecordTexts } from '../utils/assignmentBoxes'

const TYPES = ['classwork', 'homework']

export const useMyAssignments = (campusId, sessionId) => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const latest = useRef(0)

  const fetchAssignments = useCallback(async (filters = {}) => {
    if (!campusId || !sessionId) return
    const id = ++latest.current
    setLoading(true)
    setError(null)
    const result = await listMyAssignmentsService(campusId, { sessionId, ...filters })
    if (id !== latest.current) return 
    setLoading(false)
    if (result.success) setAssignments(result.data.assignments)
    else setError(result.message)
  }, [campusId, sessionId])

  const createBatch = useCallback(async (data) => {
    setSaving(true)
    const result = await createAssignmentBatchService(campusId, { sessionId, ...data })
    setSaving(false)
    return result
  }, [campusId, sessionId])

  const saveBoxEdit = useCallback(async ({ box, classwork, homework }) => {
    setSaving(true)
    try {
      const texts = { classwork: classwork.trim(), homework: homework.trim() }

      for (const type of TYPES) {
        const records = box.records[type]
        const next = texts[type]
        const [first, ...extra] = records

        if (!next) {
          for (const record of records) {
            const result = await deleteHomeworkService(campusId, record.id)
            if (!result.success) return result
          }
          continue
        }

        if (!first) {
          const result = await createAssignmentBatchService(campusId, {
            sessionId,
            assignedDate: box.assignedDate,
            dueDate: box.dueDate,
            [type]: next,
            targets: [{ classGroupId: box.classGroupId, sectionId: box.sectionId, subjectId: box.subjectId }],
          })
          if (!result.success) return result
          continue
        }

        if (next === joinRecordTexts(records)) continue

        const formData = new FormData()
        formData.append('description', next)
        const updated = await updateHomeworkService(campusId, first.id, formData)
        if (!updated.success) return updated
        for (const record of extra) {
          const result = await deleteHomeworkService(campusId, record.id)
          if (!result.success) return result
        }
      }
      return { success: true }
    } finally {
      setSaving(false)
    }
  }, [campusId, sessionId])

  const removeBox = useCallback(async (box) => {
    for (const record of [...box.records.classwork, ...box.records.homework]) {
      const result = await deleteHomeworkService(campusId, record.id)
      if (!result.success) return result
    }
    return { success: true }
  }, [campusId])

  return { assignments, loading, error, saving, fetchAssignments, createBatch, saveBoxEdit, removeBox }
}
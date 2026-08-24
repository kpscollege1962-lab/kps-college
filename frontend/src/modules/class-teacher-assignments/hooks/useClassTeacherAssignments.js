import { useState, useCallback } from 'react'
import {
  listAssignmentsService,
  addAssignmentService,
  removeAssignmentService,
} from '../services/classTeacherAssignments.service'

export const useClassTeacherAssignments = (campusId, sessionId) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await listAssignmentsService(campusId, { campusId, sessionId })
    setLoading(false)
    if (result.success) {
      setClasses(result.data.classes)
    } else {
      setError(result.message)
    }
  }, [campusId, sessionId])

  const addAssignment = useCallback(async (data) => {
    setSaving(true)
    const result = await addAssignmentService(campusId, data)
    setSaving(false)
    if (result.success) await fetchAssignments()
    return result
  }, [campusId, fetchAssignments])

  const removeAssignment = useCallback(async (assignmentId) => {
    setDeleting(true)
    const result = await removeAssignmentService(campusId, assignmentId)
    setDeleting(false)
    if (result.success) await fetchAssignments()
    return result
  }, [campusId, fetchAssignments])

  return {
    classes,
    loading,
    error,
    saving,
    deleting,
    fetchAssignments,
    addAssignment,
    removeAssignment,
  }
}

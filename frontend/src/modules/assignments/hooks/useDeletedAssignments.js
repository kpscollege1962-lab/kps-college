import { useCallback, useRef, useState } from 'react'
import { getDeletedAssignmentsService } from '../services/assignments.service'

// Soft-deleted assignments of a campus + session ("Recently deleted").
export const useDeletedAssignments = (campusId) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const latest = useRef(0)

  const fetchDeleted = useCallback(async (sessionId) => {
    if (!campusId || !sessionId) return
    const id = ++latest.current
    setLoading(true)
    setError(null)
    const result = await getDeletedAssignmentsService(campusId, { sessionId })
    if (id !== latest.current) return
    setLoading(false)
    if (result.success) setRows(result.data.assignments)
    else setError(result.message)
  }, [campusId])

  return { rows, loading, error, fetchDeleted }
}

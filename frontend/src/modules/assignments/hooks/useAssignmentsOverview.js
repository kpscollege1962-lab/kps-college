import { useState, useCallback, useRef } from 'react'
import { getAssignmentsOverviewService, getAssignmentsStructureService } from '../services/assignments.service'

export const useAssignmentsOverview = (campusId) => {
  const [structure, setStructure]     = useState([])
  const [formMasters, setFormMasters] = useState([]) // [{ classGroupId, sectionId, staffId, staffName }]
  const [assignments, setAssignments] = useState([])
  const [truncated, setTruncated]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const requestId = useRef(0)

  const fetchStructure = useCallback(async (sessionId) => {
    const result = await getAssignmentsStructureService(campusId, { sessionId })
    if (result.success) {
      setStructure(result.data.structure)
      setFormMasters(result.data.formMasters ?? [])
    } else {
      setError(result.message)
    }
  }, [campusId])

  const fetchAssignments = useCallback(async (params) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    const result = await getAssignmentsOverviewService(campusId, params)
    if (id !== requestId.current) return
    setLoading(false)
    if (result.success) {
      setAssignments(result.data.data)
      setTruncated(result.data.truncated)
    } else {
      setError(result.message)
    }
  }, [campusId])

  return { structure, formMasters, assignments, truncated, loading, error, fetchStructure, fetchAssignments }
}
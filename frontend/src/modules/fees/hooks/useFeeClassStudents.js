import { useState, useCallback } from 'react'
import { listEnrollmentsService } from '@/modules/enrollments/services/enrollments.service'

export const useFeeClassStudents = (campusId, sessionId) => {
  const [selectedClass, setSelectedClass] = useState(null) // the full classGroup object
  const [students, setStudents]           = useState([])
  const [total, setTotal]                 = useState(0)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const fetchStudentsForClass = useCallback(async (classGroup, sectionId) => {
    if (!classGroup) return
    setSelectedClass(classGroup)
    setLoading(true)
    setError(null)
    const result = await listEnrollmentsService({
      campusId,
      sessionId,
      classGroupId: classGroup.id,
      sectionId,
      status: 'active',
      limit: 100,
    })
    setLoading(false)
    if (result.success) {
      setStudents(result.data.data)
      setTotal(result.data.total)
    } else {
      setError(result.message)
    }
  }, [campusId, sessionId])

  const clearSelection = useCallback(() => {
    setSelectedClass(null)
    setStudents([])
    setTotal(0)
    setError(null)
  }, [])

  return { selectedClass, students, total, loading, error, fetchStudentsForClass, clearSelection }
}
import { useState, useCallback } from 'react'
import { getStudentService } from '../services/students.service'

export const useStudent = (studentId) => {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetchStudent = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getStudentService(studentId)
    setLoading(false)
    if (result.success) {
      setStudent(result.data.student)
    } else {
      setError(result.message)
    }
  }, [studentId])

  return { student, loading, error, fetchStudent }
}

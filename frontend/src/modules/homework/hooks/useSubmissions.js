import { useState, useCallback } from 'react'
import { listSubmissionsService, markSubmissionDoneService } from '../services/homework.service'

export const useSubmissions = (campusId) => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [marking, setMarking]         = useState(false)

  const fetchSubmissions = useCallback(async (homeworkId) => {
    setLoading(true)
    setError(null)
    const result = await listSubmissionsService(campusId, homeworkId)
    setLoading(false)
    if (result.success) setSubmissions(result.data.submissions)
    else setError(result.message)
  }, [campusId])

  const markDone = useCallback(async (homeworkId, submissionId) => {
    setMarking(true)
    const result = await markSubmissionDoneService(campusId, homeworkId, submissionId)
    setMarking(false)
    if (result.success) await fetchSubmissions(homeworkId)
    return result
  }, [campusId, fetchSubmissions])

  return { submissions, loading, error, marking, fetchSubmissions, markDone }
}
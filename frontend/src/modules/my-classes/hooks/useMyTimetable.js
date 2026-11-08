import { useEffect, useState } from 'react'
import { getMyTimetableService } from '../services/teacherWorkspace.service'

// The signed-in teacher's own timetable at a campus.
export const useMyTimetable = (campusId) => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!campusId) return
    let alive = true
    setLoading(true)
    setError(null)
    getMyTimetableService(campusId).then((result) => {
      if (!alive) return
      setLoading(false)
      if (result.success) setEntries(result.data.entries)
      else setError(result.message)
    })
    return () => { alive = false }
  }, [campusId])

  return { entries, loading, error }
}
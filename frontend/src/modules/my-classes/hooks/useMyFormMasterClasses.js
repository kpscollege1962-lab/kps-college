import { useEffect, useState } from 'react'
import { listMyFormMasterClassesService } from '../services/teacherWorkspace.service'

// The classes (class + section) where the signed-in teacher has Period 1, i.e. is form master.
export const useMyFormMasterClasses = (campusId) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false) // true once the first answer (or error) is in

  useEffect(() => {
    if (!campusId) return
    let alive = true
    setLoading(true)
    setError(null)
    listMyFormMasterClassesService(campusId).then((result) => {
      if (!alive) return
      setLoading(false)
      setLoaded(true)
      if (result.success) setClasses(result.data.classes)
      else setError(result.message)
    })
    return () => { alive = false }
  }, [campusId])

  return { classes, loading, loaded, error }
}

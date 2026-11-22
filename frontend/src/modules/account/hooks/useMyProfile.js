import { useCallback, useEffect, useState } from 'react'
import { getMyProfileService } from '../services/account.service'

// { user, staff, student } for the signed-in person (staff / student are null when not linked).
export const useMyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apply = useCallback((result) => {
    setLoading(false)
    if (result.success) { setProfile(result.data); setError(null) }
    else setError(result.message)
  }, [])

  // First load: state changes only when the answer arrives.
  useEffect(() => {
    let alive = true
    getMyProfileService().then((result) => { if (alive) apply(result) })
    return () => { alive = false }
  }, [apply])

  // After a change in Settings: fetch again quietly (the page stays on screen).
  const reload = useCallback(() => getMyProfileService().then(apply), [apply])

  return { profile, loading, error, reload }
}

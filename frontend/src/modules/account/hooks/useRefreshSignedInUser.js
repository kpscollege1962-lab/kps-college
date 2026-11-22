import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateUser } from '@/modules/auth/store/auth.slice'
import { getMyAccountService } from '../services/account.service'

// The user saved at login can be out of date (name title, photo, email changed since).
// Re-read the signed-in account from the server once per app load and update the store,
// so the top bar always shows the current name, e.g. "Mr. HAIDER ALI KHAN".
export const useRefreshSignedInUser = (userId) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!userId) return
    let alive = true
    getMyAccountService().then((result) => {
      if (alive && result.success) dispatch(updateUser(result.data.user))
    })
    return () => { alive = false }
  }, [userId, dispatch])
}

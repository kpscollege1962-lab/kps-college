import { useDispatch, useSelector } from 'react-redux'
import { setActiveSession, clearSessionContext } from '../state/sessionContext.slice'

export const useSessionContext = () => {
  const dispatch = useDispatch()

  const { activeSession, sessions, loadStatus } = useSelector(
    (state) => state.sessionContext
  )

  // Switch to a different session. Synchronous — no API call needed since
  // all campus sessions are already loaded in state from role selection.
  const selectSession = (session) => dispatch(setActiveSession(session))

  const clearContext = () => dispatch(clearSessionContext())

  return {
    // state
    activeSession,
    sessions,
    loadStatus,

    // actions
    selectSession,
    clearContext,
  }
}

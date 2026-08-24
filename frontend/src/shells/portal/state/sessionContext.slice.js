import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import { sessionContextExtraReducers } from './sessionContext.reducers'

// activeSession: { id, name, status, start_date, end_date }
//   Persisted so the selected session survives page refresh within the same tab.
// sessions: all school-wide sessions.
//   Persisted so the session switcher can render without re-fetching on refresh.

const statusTemplate = { loading: false, success: null, message: '' }

const sessionContextSlice = createSlice({
  name: 'sessionContext',
  initialState: {
    activeSession: null,
    sessions:      [],
    loadStatus:    { ...statusTemplate },
  },
  reducers: {
    // Synchronous switch — session is already in the sessions list,
    // no API call needed. Used by the session switcher in Step 3.
    setActiveSession(state, action) {
      state.activeSession = action.payload
    },
    clearSessionContext(state) {
      state.activeSession = null
      state.sessions      = []
      state.loadStatus    = { ...statusTemplate }
    },
  },
  extraReducers: sessionContextExtraReducers,
})

const sessionContextPersistConfig = {
  key: 'sessionContext',
  storage: sessionStorage,
  whitelist: ['activeSession', 'sessions'],
}

export const persistedSessionContextReducer = persistReducer(
  sessionContextPersistConfig,
  sessionContextSlice.reducer
)

export const { setActiveSession, clearSessionContext } = sessionContextSlice.actions
export default sessionContextSlice.reducer

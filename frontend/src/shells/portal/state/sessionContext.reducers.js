import { mapAsyncReducers } from '@/app/store/store.utils'
import { loadSessionsThunk } from './sessionContext.thunks'
import { logoutThunk } from '@/modules/auth/store/auth.thunks'

const statusTemplate = { loading: false, success: null, message: '' }

export const sessionContextExtraReducers = (builder) => {

  // Clear session context on logout
  builder.addCase(logoutThunk.fulfilled, (state) => {
    state.activeSession = null
    state.sessions      = []
    state.loadStatus    = { ...statusTemplate }
  })

  // Sessions load independently — triggered once at portal entry
  mapAsyncReducers(builder, loadSessionsThunk, 'loadStatus', {
    onFulfilled: (state, action) => {
      state.sessions      = action.payload.sessions
      state.activeSession = action.payload.activeSession
    },
    onRejected: (state) => {
      state.sessions      = []
      state.activeSession = null
    },
  })
}

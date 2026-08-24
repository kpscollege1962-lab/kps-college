import { mapAsyncReducers } from '@/app/store/store.utils'
import { selectRoleThunk } from './roleContext.thunks'
import { logoutThunk } from './auth.thunks'

const statusTemplate = { loading: false, success: null, message: '' }

export const roleContextExtraReducers = (builder) => {
  // Clear context automatically when the user logs out
  builder.addCase(logoutThunk.fulfilled, (state) => {
    state.activeRole   = null
    state.rules        = []
    state.selectStatus = { ...statusTemplate }
  })

  mapAsyncReducers(builder, selectRoleThunk, 'selectStatus', {
    onFulfilled: (state, action) => {
      state.activeRole = action.payload.context
      state.rules      = action.payload.rules
    },
  })
}

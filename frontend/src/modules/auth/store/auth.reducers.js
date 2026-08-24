import { mapAsyncReducers } from '@/app/store/store.utils'
import { loginThunk, logoutThunk } from './auth.thunks'

export const authExtraReducers = (builder) => {
  mapAsyncReducers(builder, loginThunk, 'loginStatus', {
    onFulfilled: (state, action) => {
      state.user            = action.payload.data?.user          || null
      state.contexts        = action.payload.data?.contexts      || []
      state.accessToken     = action.payload.data?.accessToken   || null
      state.refreshToken    = action.payload.data?.refreshToken  || null
      state.isAuthenticated = true
    },
  })

  mapAsyncReducers(builder, logoutThunk, 'logoutStatus', {
    onFulfilled: (state) => {
      state.user            = null
      state.contexts        = []
      state.accessToken     = null
      state.refreshToken    = null
      state.isAuthenticated = false
    },
  })
}

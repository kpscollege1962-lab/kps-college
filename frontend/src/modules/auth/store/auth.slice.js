import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import { authExtraReducers } from './auth.reducers'

// user shape from backend: { id, first_name, last_name, username, email,
//                            phone, profile_photo, is_active, last_login_at }
// contexts shape from backend: [{ roleId, roleName, layer, campusId, campusName }]

const statusTemplate = { loading: false, success: null, message: '' }

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    contexts: [],
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    loginStatus:  { ...statusTemplate },
    logoutStatus: { ...statusTemplate },
  },
  reducers: {
    clearAuth(state) {
      state.user = null
      state.contexts = []
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
  extraReducers: authExtraReducers,
})

const authPersistConfig = {
  key: 'auth',
  storage: sessionStorage,
  whitelist: ['user', 'contexts', 'accessToken', 'refreshToken', 'isAuthenticated'],
}

export const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)

export const { clearAuth } = authSlice.actions
export default authSlice.reducer

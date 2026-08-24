import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import { roleContextExtraReducers } from './roleContext.reducers'

// activeRole: { roleId, roleName, layer, campusId, campusName }
// rules: serialized CASL ability.rules from backend.
//   Plain JSON array — stored here because Ability objects
//   are class instances and cannot be persisted in Redux.
//   Reconstructed into an Ability object in AbilityProvider.

const statusTemplate = { loading: false, success: null, message: '' }

const roleContextSlice = createSlice({
  name: 'roleContext',
  initialState: {
    activeRole: null,
    rules: [],
    selectStatus: { ...statusTemplate },
  },
  reducers: {
    clearRoleContext(state) {
      state.activeRole   = null
      state.rules        = []
      state.selectStatus = { ...statusTemplate }
    },
  },
  extraReducers: roleContextExtraReducers,
})

const roleContextPersistConfig = {
  key: 'roleContext',
  storage: sessionStorage,
  whitelist: ['activeRole', 'rules'],
}

export const persistedRoleContextReducer = persistReducer(
  roleContextPersistConfig,
  roleContextSlice.reducer
)

export const { clearRoleContext } = roleContextSlice.actions
export default roleContextSlice.reducer

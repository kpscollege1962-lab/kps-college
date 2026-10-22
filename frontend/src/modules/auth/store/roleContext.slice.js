import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import { roleContextExtraReducers } from './roleContext.reducers'

// activeRole: { roleId, roleName, layer, campusId, campusName }
// rules: serialized CASL ability.rules from backend.
//   Plain JSON array — stored here because Ability objects
//   are class instances and cannot be persisted in Redux.
//   Reconstructed into an Ability object in AbilityProvider.
// workingCampus: { id, name } — for a Super Admin only: the campus the campus pages
//   (Classes, Timetable, Fees...) work inside. null for every other role.

const statusTemplate = { loading: false, success: null, message: '' }

const roleContextSlice = createSlice({
  name: 'roleContext',
  initialState: {
    activeRole: null,
    rules: [],
    workingCampus: null,
    selectStatus: { ...statusTemplate },
  },
  reducers: {
    clearRoleContext(state) {
      state.activeRole    = null
      state.rules         = []
      state.workingCampus = null
      state.selectStatus  = { ...statusTemplate }
    },
    setWorkingCampus(state, action) {
      state.workingCampus = action.payload ?? null
    },
  },
  extraReducers: roleContextExtraReducers,
})

const roleContextPersistConfig = {
  key: 'roleContext',
  storage: sessionStorage,
  whitelist: ['activeRole', 'rules', 'workingCampus'],
}

export const persistedRoleContextReducer = persistReducer(
  roleContextPersistConfig,
  roleContextSlice.reducer
)

export const { clearRoleContext, setWorkingCampus } = roleContextSlice.actions
export default roleContextSlice.reducer
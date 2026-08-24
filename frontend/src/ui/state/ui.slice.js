import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light', // 'light' | 'dark'
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
  },
})

const uiPersistConfig = {
  key: 'ui',
  storage,
}

export const persistedUiReducer = persistReducer(uiPersistConfig, uiSlice.reducer)

export const { toggleTheme, setTheme } = uiSlice.actions
export default uiSlice.reducer

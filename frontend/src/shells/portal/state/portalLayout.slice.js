import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const portalLayoutSlice = createSlice({
  name: 'portalLayout',
  initialState: {
    sidebarOpen: true,        // desktop collapse state
    mobileSidebarOpen: false, // mobile drawer state
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    openSidebar: (state) => { state.sidebarOpen = true },
    closeSidebar: (state) => { state.sidebarOpen = false },
    openMobileSidebar: (state) => { state.mobileSidebarOpen = true },
    closeMobileSidebar: (state) => { state.mobileSidebarOpen = false },
    toggleMobileSidebar: (state) => { state.mobileSidebarOpen = !state.mobileSidebarOpen },
  },
})

const portalLayoutPersistConfig = {
  key: 'portalLayout',
  storage,
  whitelist: ['sidebarOpen'], // don't persist mobile drawer state
}

export const persistedPortalLayoutReducer = persistReducer(portalLayoutPersistConfig, portalLayoutSlice.reducer)

export const {
  toggleSidebar, openSidebar, closeSidebar,
  openMobileSidebar, closeMobileSidebar, toggleMobileSidebar,
} = portalLayoutSlice.actions

export default portalLayoutSlice.reducer

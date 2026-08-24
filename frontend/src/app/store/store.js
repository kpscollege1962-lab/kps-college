import { configureStore } from '@reduxjs/toolkit'
import { persistStore } from 'redux-persist'
import { persistedUiReducer } from '@/ui/state/ui.slice'
import { persistedPortalLayoutReducer } from '@/shells/portal/state/portalLayout.slice'
import { persistedAuthReducer } from '@/modules/auth/store/auth.slice'
import { persistedRoleContextReducer } from '@/modules/auth/store/roleContext.slice'
import { persistedSessionContextReducer } from '@/shells/portal/state/sessionContext.slice'

export const store = configureStore({
  reducer: {
    ui:             persistedUiReducer,
    portalLayout:   persistedPortalLayoutReducer,
    auth:           persistedAuthReducer,
    roleContext:    persistedRoleContextReducer,
    sessionContext: persistedSessionContextReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
})

export const persistor = persistStore(store)

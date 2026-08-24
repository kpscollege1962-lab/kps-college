import { createAsyncThunk } from '@reduxjs/toolkit'
import { listAcademicSessionsService } from '@/modules/academic-sessions/services/academicSessions.service'

export const loadSessionsThunk = createAsyncThunk(
  'sessionContext/loadSessions',

  async (_arg, { rejectWithValue }) => {
    const result = await listAcademicSessionsService({ limit: 100 })
    if (!result.success) return rejectWithValue(result)

    const sessions = result.data.data ?? []

    const activeSession =
      sessions.find((s) => s.status === 'active')   ??
      sessions.find((s) => s.status === 'upcoming') ??
      sessions[0]                                   ??
      null

    return { sessions, activeSession }
  },

  {
    // Skip the API call if sessions are already loaded and this is not a
    // forced refresh. Prevents redundant fetches on role switch.
    condition: (arg, { getState }) => {
      const force = arg?.force ?? false
      if (force) return true
      const { sessions, loadStatus } = getState().sessionContext
      if (sessions.length > 0 && !loadStatus.loading) return false
      return true
    },
  }
)

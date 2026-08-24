import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAbilitiesService } from '../services/abilities.service'

// Selects a role as the active working context and fetches CASL ability rules.
export const selectRoleThunk = createAsyncThunk(
  'roleContext/selectRole',
  async ({ context }, { rejectWithValue }) => {

    const abilitiesResult = await fetchAbilitiesService(
      context.roleId,
      context.campusId ?? null
    )
    if (!abilitiesResult.success) return rejectWithValue(abilitiesResult)

    return {
      context,
      rules: abilitiesResult.data?.rules ?? [],
    }
  }
)

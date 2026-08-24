import { createAsyncThunk } from '@reduxjs/toolkit'
import { setAccessToken, clearAccessToken } from '@/lib/token'
import { loginService, logoutService } from '../services/auth.service'

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    const result = await loginService(credentials)
    if (!result.success) return rejectWithValue(result)
    if (result.data?.accessToken) setAccessToken(result.data.accessToken)
    return result
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const result = await logoutService()
    if (!result.success) return rejectWithValue(result)
    clearAccessToken()
    return result
  }
)

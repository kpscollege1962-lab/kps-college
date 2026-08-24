import { handleApiCall } from '@/lib/apiUtils'
import { loginApi, forgotPasswordApi, resetPasswordApi } from '../api/auth.api'

export const loginService = (credentials) =>
  handleApiCall(() => loginApi(credentials), 'Something went wrong during login')

export const forgotPasswordService = (data) =>
  handleApiCall(() => forgotPasswordApi(data), 'Something went wrong. Please try again.')

export const resetPasswordService = (data) =>
  handleApiCall(() => resetPasswordApi(data), 'Something went wrong. Please try again.')

// Logout is client-side only — no backend endpoint
export const logoutService = async () =>
  ({ success: true, message: 'Logged out successfully', data: null })

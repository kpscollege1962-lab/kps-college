import api from '@/lib/api'

export const loginApi = (payload) =>
  api.post('/auth/login', payload)

export const forgotPasswordApi = (payload) =>
  api.post('/auth/forgot-password', payload)

export const resetPasswordApi = (payload) =>
  api.post('/auth/reset-password', payload)

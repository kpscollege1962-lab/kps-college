import api from '@/lib/api'

// The signed-in person's own account (the server always uses the logged-in user).
export const getMyAccountApi    = () => api.get('/me/account')
export const getMyProfileApi    = () => api.get('/me/profile')
export const updateMyContactApi = (data) => api.patch('/me/contact', data)
export const updateMyPhotoApi   = (formData) =>
  api.post('/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const changeMyPasswordApi = (data) => api.post('/me/password', data)

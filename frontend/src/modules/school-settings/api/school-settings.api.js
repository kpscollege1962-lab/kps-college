import api from '@/lib/api'

export const getSchoolSettingsApi = () =>
  api.get('/school-settings')

export const updateSchoolSettingsApi = (data) =>
  api.patch('/school-settings', data)

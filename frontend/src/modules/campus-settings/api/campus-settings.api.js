import api from '@/lib/api'

export const getCampusSettingsApi = (campusId) =>
  api.get(`/campuses/${campusId}/settings`)

export const updateCampusSettingsApi = (campusId, data) =>
  api.patch(`/campuses/${campusId}/settings`, data)

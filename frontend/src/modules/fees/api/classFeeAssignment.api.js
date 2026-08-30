import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/fee-class-setup`

export const getClassFeeSetupApi = (campusId, classGroupId, params) =>
  api.get(`${base(campusId)}/${classGroupId}`, { params })

export const assignClassFeesApi = (campusId, classGroupId, data) =>
  api.post(`${base(campusId)}/${classGroupId}`, data)
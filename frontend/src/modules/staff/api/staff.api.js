import api from '@/lib/api'

export const listStaffApi = (campusId, params) =>
  api.get('/staff', { params: { campusId, ...params } })

export const getStaffApi = (campusId, staffId) =>
  api.get(`/staff/${staffId}`, { params: { campusId } })

export const createStaffApi = (campusId, data) =>
  api.post('/staff', data, { params: { campusId } })

export const updateStaffApi = (campusId, staffId, data) =>
  api.patch(`/staff/${staffId}`, data, { params: { campusId } })

export const updateStaffPostingApi = (campusId, staffId, data) =>
  api.patch(`/staff/${staffId}/posting`, data, { params: { campusId } })

export const searchEligibleStaffApi = (campusId, params) =>
  api.get('/staff/eligible', { params: { campusId, ...params } })

export const createStaffPostingApi = (campusId, staffId, data) =>
  api.post(`/staff/${staffId}/posting`, data, { params: { campusId } })

import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/classes`

export const listClassesApi        = (campusId, params)                         => api.get(base(campusId), { params })
export const getClassApi           = (campusId, classGroupId)                   => api.get(`${base(campusId)}/${classGroupId}`)
export const createClassApi        = (campusId, data)                           => api.post(base(campusId), data)
export const updateClassApi        = (campusId, classGroupId, data)             => api.patch(`${base(campusId)}/${classGroupId}`, data)
export const deleteClassApi        = (campusId, classGroupId)                   => api.delete(`${base(campusId)}/${classGroupId}`)
export const seedDefaultClassesApi = (campusId, data)                           => api.post(`${base(campusId)}/seed-defaults`, data)
export const cloneClassesApi       = (campusId, data)                           => api.post(`${base(campusId)}/clone`, data)

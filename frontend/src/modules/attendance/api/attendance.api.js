import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/attendance`

export const getMySectionsApi      = (campusId, sessionId, date) => api.get(`${base(campusId)}/my-sections`, { params: { sessionId, date } })
export const getOrCreateSessionApi = (campusId, data)            => api.post(`${base(campusId)}/sessions`, data)
export const saveRecordsApi        = (campusId, sessionId, data) => api.put(`${base(campusId)}/sessions/${sessionId}/records`, data)
export const submitSessionApi      = (campusId, sessionId)       => api.post(`${base(campusId)}/sessions/${sessionId}/submit`)
export const reopenSessionApi      = (campusId, sessionId)       => api.post(`${base(campusId)}/sessions/${sessionId}/reopen`)
export const updateRemarksApi      = (campusId, recordId, data)  => api.patch(`${base(campusId)}/records/${recordId}/remarks`, data)

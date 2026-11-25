import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/attendance`

export const getMySectionsApi      = (campusId, sessionId, date) => api.get(`${base(campusId)}/my-sections`, { params: { sessionId, date } })
export const getOrCreateSessionApi = (campusId, data)            => api.post(`${base(campusId)}/sessions`, data)
export const saveRecordsApi        = (campusId, sessionId, data) => api.put(`${base(campusId)}/sessions/${sessionId}/records`, data)
export const submitSessionApi      = (campusId, sessionId)       => api.post(`${base(campusId)}/sessions/${sessionId}/submit`)
export const reopenSessionApi      = (campusId, sessionId)       => api.post(`${base(campusId)}/sessions/${sessionId}/reopen`)
export const updateRemarksApi      = (campusId, recordId, data)  => api.patch(`${base(campusId)}/records/${recordId}/remarks`, data)

// One class on one date (form master's Attendance tab and the admin view).
export const getRegisterApi  = (campusId, params) => api.get(`${base(campusId)}/register`, { params })
export const saveRegisterApi = (campusId, data)   => api.put(`${base(campusId)}/register`, data)

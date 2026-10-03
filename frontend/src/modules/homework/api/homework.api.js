import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/homework`

export const listHomeworkApi  = (campusId, params) => api.get(base(campusId), { params })
export const getHomeworkApi   = (campusId, homeworkId) => api.get(`${base(campusId)}/${homeworkId}`)

// multipart — pass a FormData instance built by the caller
export const createHomeworkApi = (campusId, formData) =>
  api.post(base(campusId), formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateHomeworkApi = (campusId, homeworkId, formData) =>
  api.patch(`${base(campusId)}/${homeworkId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteHomeworkApi = (campusId, homeworkId) => api.delete(`${base(campusId)}/${homeworkId}`)

export const listSubmissionsApi = (campusId, homeworkId) =>
  api.get(`${base(campusId)}/${homeworkId}/submissions`)

export const markSubmissionDoneApi = (campusId, homeworkId, submissionId) =>
  api.patch(`${base(campusId)}/${homeworkId}/submissions/${submissionId}/mark-done`)

export const submitHomeworkApi = (campusId, homeworkId, formData) =>
  api.post(`${base(campusId)}/${homeworkId}/submissions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
import api from '@/lib/api'

const BASE = '/subjects'

export const listSubjectsApi   = (params)          => api.get(BASE, { params })
export const createSubjectApi  = (data)            => api.post(BASE, data)
export const updateSubjectApi  = (subjectId, data) => api.patch(`${BASE}/${subjectId}`, data)
export const deleteSubjectApi  = (subjectId)       => api.delete(`${BASE}/${subjectId}`)

import api from '@/lib/api'

export const listStudentsApi  = (params)          => api.get('/students', { params })
export const getStudentApi    = (studentId)        => api.get(`/students/${studentId}`)
export const createStudentApi = (data)             => api.post('/students', data)
export const updateStudentApi = (studentId, data)  => api.patch(`/students/${studentId}`, data)

import api from '@/lib/api'

const BASE = '/enrollments'

export const listEnrollmentsApi        = (params)              => api.get(BASE, { params })
export const getEnrollmentApi          = (enrollmentId)        => api.get(`${BASE}/${enrollmentId}`)
export const createEnrollmentApi       = (data)                => api.post(BASE, data)
export const deleteEnrollmentApi       = (enrollmentId)        => api.delete(`${BASE}/${enrollmentId}`)
export const searchEligibleStudentsApi = (params)              => api.get(`${BASE}/eligible-students`, { params })

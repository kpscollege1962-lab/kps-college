import api from '@/lib/api'

const BASE = '/academic-sessions'

export const listAcademicSessionsApi      = (params)     => api.get(BASE, { params })
export const getAcademicSessionApi        = (id)         => api.get(`${BASE}/${id}`)
export const createAcademicSessionApi     = (data)       => api.post(BASE, data)
export const updateAcademicSessionApi     = (id, data)   => api.patch(`${BASE}/${id}`, data)
export const transitionAcademicSessionApi = (id)         => api.patch(`${BASE}/${id}/status`)
export const deleteAcademicSessionApi     = (id)         => api.delete(`${BASE}/${id}`)

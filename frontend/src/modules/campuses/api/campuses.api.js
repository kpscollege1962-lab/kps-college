import api from '@/lib/api'

export const listCampusesApi = (params) =>
  api.get('/campuses', { params })

export const getCampusApi = (id) =>
  api.get(`/campuses/${id}`)

export const createCampusApi = (data) =>
  api.post('/campuses', data)

export const updateCampusApi = (id, data) =>
  api.patch(`/campuses/${id}`, data)

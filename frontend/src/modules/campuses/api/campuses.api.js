import api from '@/lib/api'

export const listCampusesApi = (params) =>
  api.get('/campuses', { params })

export const getCampusApi = (id) =>
  api.get(`/campuses/${id}`)

export const createCampusApi = (data) =>
  api.post('/campuses', data)

export const updateCampusApi = (id, data) =>
  api.patch(`/campuses/${id}`, data)

export const uploadCampusBrandingApi = (id, field, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post(`/campuses/${id}/branding/${field}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
 
export const removeCampusBrandingApi = (id, field) =>
  api.delete(`/campuses/${id}/branding/${field}`)
 


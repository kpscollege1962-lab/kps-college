import api from '@/lib/api'

// Daily rota (arrangement for absent teachers) of one campus and date.
const base = (campusId) => `/campuses/${campusId}/rota`

export const getRotaApi    = (campusId, date)       => api.get(base(campusId), { params: { date } })
export const saveRotaApi   = (campusId, date, data) => api.put(`${base(campusId)}/${date}`, data)
export const deleteRotaApi = (campusId, date)       => api.delete(`${base(campusId)}/${date}`)

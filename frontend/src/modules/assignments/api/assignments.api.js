import api from '@/lib/api'

const overviewBase = (campusId) => `/campuses/${campusId}/homework/overview`

export const getAssignmentsOverviewApi  = (campusId, params) => api.get(overviewBase(campusId), { params })
export const getAssignmentsStructureApi = (campusId, params) => api.get(`${overviewBase(campusId)}/structure`, { params })
export const listCampusesApi            = () => api.get('/campuses', { params: { limit: 100 } })
import api from '@/lib/api'

const homeworkBase = (campusId) => `/campuses/${campusId}/homework`
const overviewBase = (campusId) => `${homeworkBase(campusId)}/overview`
const adminBase    = (campusId, homeworkId) => `${homeworkBase(campusId)}/admin/${homeworkId}`

export const getAssignmentsOverviewApi  = (campusId, params) => api.get(overviewBase(campusId), { params })
export const getAssignmentsStructureApi = (campusId, params) => api.get(`${overviewBase(campusId)}/structure`, { params })
export const listCampusesApi            = () => api.get('/campuses', { params: { limit: 100 } })

// Admin actions on any teacher's assignment (HomeworkOverview permission on the server).
export const getDeletedAssignmentsApi   = (campusId, params) => api.get(`${overviewBase(campusId)}/deleted`, { params })
export const adminUpdateAssignmentApi   = (campusId, homeworkId, data) => api.patch(adminBase(campusId, homeworkId), data)
export const adminDeleteAssignmentApi   = (campusId, homeworkId) => api.delete(adminBase(campusId, homeworkId))
export const adminRestoreAssignmentApi  = (campusId, homeworkId) => api.post(`${adminBase(campusId, homeworkId)}/restore`)
export const adminPurgeAssignmentApi    = (campusId, homeworkId) => api.delete(`${adminBase(campusId, homeworkId)}/permanent`)

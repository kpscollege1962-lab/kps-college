import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/class-teacher-assignments`

export const listAssignmentsApi  = (campusId, params) => api.get(base(campusId), { params })
export const addAssignmentApi    = (campusId, data)   => api.post(base(campusId), data)
export const removeAssignmentApi = (campusId, assignmentId) => api.delete(`${base(campusId)}/${assignmentId}`)
export const searchCampusStaffApi = (campusId, params) => api.get(`${base(campusId)}/staff-search`, { params })

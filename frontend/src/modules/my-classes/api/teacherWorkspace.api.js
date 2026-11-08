import api from '@/lib/api'

export const getMyTimetableApi = (campusId) =>
  api.get('/teacher/my-timetable', { params: { campusId } })

export const listMyAssignmentsApi = (campusId, params) =>
  api.get(`/campuses/${campusId}/homework/mine`, { params })

export const createAssignmentBatchApi = (campusId, data) =>
  api.post(`/campuses/${campusId}/homework/batch`, data)
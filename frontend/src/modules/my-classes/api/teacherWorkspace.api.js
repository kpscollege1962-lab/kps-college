import api from '@/lib/api'

export const getMyTimetableApi = (campusId) =>
  api.get('/teacher/my-timetable', { params: { campusId } })

export const listMyAssignmentsApi = (campusId, params) =>
  api.get(`/campuses/${campusId}/homework/mine`, { params })

export const createAssignmentBatchApi = (campusId, data) =>
  api.post(`/campuses/${campusId}/homework/batch`, data)
export const listMyFormMasterClassesApi = (campusId) =>
  api.get('/teacher/form-master-classes', { params: { campusId } })

export const getFormMasterReportApi = (campusId, params) =>
  api.get(`/campuses/${campusId}/homework/form-master-report`, { params })

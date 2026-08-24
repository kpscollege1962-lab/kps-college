import api from '@/lib/api'

export const getStatusListReportApi = (campusId, { sessionId, dateFrom, dateTo, statuses }) =>
  api.get(`/campuses/${campusId}/attendance/reports/status-list`, {
    params: { sessionId, dateFrom, dateTo, ...(statuses ? { statuses: statuses.join(',') } : {}) },
  })

export const listReportSectionsApi = (campusId, { sessionId }) =>
  api.get(`/campuses/${campusId}/attendance/reports/sections`, { params: { sessionId } })

export const getClassRegisterReportApi = (campusId, { sessionId, sectionId, dateFrom, dateTo }) =>
  api.get(`/campuses/${campusId}/attendance/reports/class-register`, {
    params: { sessionId, sectionId, dateFrom, dateTo },
  })

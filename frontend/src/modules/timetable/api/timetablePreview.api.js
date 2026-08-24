import api from '@/lib/api'

const BASE = (campusId) => `/campuses/${campusId}/timetable/preview`

export const getClassWisePreviewApi   = (campusId, sessionId) =>
  api.get(`${BASE(campusId)}/class`,   { params: { sessionId } })

export const getStaffWisePreviewApi   = (campusId, sessionId) =>
  api.get(`${BASE(campusId)}/staff`,   { params: { sessionId } })

export const getSubjectWisePreviewApi = (campusId, sessionId) =>
  api.get(`${BASE(campusId)}/subject`, { params: { sessionId } })

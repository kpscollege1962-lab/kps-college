import api from '@/lib/api'

const BASE = (campusId) => `/campuses/${campusId}/timetable`

export const getCampusTimetableApi  = (campusId, sessionId) =>
  api.get(BASE(campusId), { params: { ...(sessionId ? { sessionId } : {}) } })
export const getTimetableStaffApi   = (campusId)                           => api.get(`${BASE(campusId)}/staff`)
export const getClassTimetableApi   = (campusId, classGroupId, sectionId)  =>
  api.get(`${BASE(campusId)}/class`, { params: { classGroupId, sectionId } })

export const createPeriodApi        = (campusId, data)               => api.post(`${BASE(campusId)}/periods`, data)
export const deletePeriodApi        = (campusId, periodId)           => api.delete(`${BASE(campusId)}/periods/${periodId}`)

export const upsertSlotApi          = (campusId, periodId, classGroupId, sectionId, data) =>
  api.put(`${BASE(campusId)}/periods/${periodId}/classes/${classGroupId}/sections/${sectionId}/slot`, data)
export const clearSlotApi           = (campusId, periodId, classGroupId, sectionId) =>
  api.delete(`${BASE(campusId)}/periods/${periodId}/classes/${classGroupId}/sections/${sectionId}/slot`)

export const updatePeriodBreaksApi  = (campusId, periodId, data) =>
  api.patch(`${BASE(campusId)}/periods/${periodId}/breaks`, data)

export const batchUpdateTimingsApi  = (campusId, data) =>
  api.patch(`${BASE(campusId)}/timings/batch`, data)

export const swapSlotsApi = (campusId, slotA, slotB) =>
  api.post(`${BASE(campusId)}/slots/swap`, { slotA, slotB })

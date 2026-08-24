import { handleApiCall } from '@/lib/apiUtils'
import {
  getCampusTimetableApi,
  getClassTimetableApi,
  createPeriodApi,
  deletePeriodApi,
  upsertSlotApi,
  clearSlotApi,
  getTimetableStaffApi,
  updatePeriodBreaksApi,
  batchUpdateTimingsApi,
  swapSlotsApi,
} from '../api/timetable.api'

export const getCampusTimetableService = (campusId, sessionId) =>
  handleApiCall(() => getCampusTimetableApi(campusId, sessionId), 'Failed to fetch timetable')

export const getClassTimetableService = (campusId, classGroupId, sectionId) =>
  handleApiCall(() => getClassTimetableApi(campusId, classGroupId, sectionId), 'Failed to fetch class timetable')

export const createPeriodService = (campusId, data) =>
  handleApiCall(() => createPeriodApi(campusId, data), 'Failed to create period')

export const deletePeriodService = (campusId, periodId) =>
  handleApiCall(() => deletePeriodApi(campusId, periodId), 'Failed to delete period')

export const upsertSlotService = (campusId, periodId, classGroupId, sectionId, data) =>
  handleApiCall(() => upsertSlotApi(campusId, periodId, classGroupId, sectionId, data), 'Failed to update slot')

export const clearSlotService = (campusId, periodId, classGroupId, sectionId) =>
  handleApiCall(() => clearSlotApi(campusId, periodId, classGroupId, sectionId), 'Failed to clear slot')

export const getTimetableStaffService = (campusId) =>
  handleApiCall(() => getTimetableStaffApi(campusId), 'Failed to fetch staff')

export const updatePeriodBreaksService = (campusId, periodId, data) =>
  handleApiCall(() => updatePeriodBreaksApi(campusId, periodId, data), 'Failed to update breaks')

export const batchUpdateTimingsService = (campusId, data) =>
  handleApiCall(() => batchUpdateTimingsApi(campusId, data), 'Failed to update timings')

export const swapSlotsService = (campusId, slotA, slotB) =>
  handleApiCall(() => swapSlotsApi(campusId, slotA, slotB), 'Failed to swap slots')

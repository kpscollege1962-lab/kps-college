import { handleApiCall } from '@/lib/apiUtils'
import {
  getMySectionsApi,
  getOrCreateSessionApi,
  saveRecordsApi,
  submitSessionApi,
  reopenSessionApi,
  updateRemarksApi,
} from '../api/attendance.api'

export const getMySectionsService = (campusId, sessionId, date) =>
  handleApiCall(() => getMySectionsApi(campusId, sessionId, date), 'Failed to fetch sections')

export const getOrCreateSessionService = (campusId, data) =>
  handleApiCall(() => getOrCreateSessionApi(campusId, data), 'Failed to open attendance register')

export const saveRecordsService = (campusId, sessionId, data) =>
  handleApiCall(() => saveRecordsApi(campusId, sessionId, data), 'Failed to save attendance records')

export const submitSessionService = (campusId, sessionId) =>
  handleApiCall(() => submitSessionApi(campusId, sessionId), 'Failed to submit register')

export const reopenSessionService = (campusId, sessionId) =>
  handleApiCall(() => reopenSessionApi(campusId, sessionId), 'Failed to reopen register')

export const updateRemarksService = (campusId, recordId, data) =>
  handleApiCall(() => updateRemarksApi(campusId, recordId, data), 'Failed to update remarks')

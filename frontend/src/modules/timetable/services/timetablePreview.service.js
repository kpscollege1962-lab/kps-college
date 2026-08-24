import { handleApiCall } from '@/lib/apiUtils'
import {
  getClassWisePreviewApi,
  getStaffWisePreviewApi,
  getSubjectWisePreviewApi,
} from '../api/timetablePreview.api'

export const getClassWisePreviewService   = (campusId, sessionId) =>
  handleApiCall(() => getClassWisePreviewApi(campusId, sessionId),   'Failed to fetch class timetable preview')

export const getStaffWisePreviewService   = (campusId, sessionId) =>
  handleApiCall(() => getStaffWisePreviewApi(campusId, sessionId),   'Failed to fetch staff timetable preview')

export const getSubjectWisePreviewService = (campusId, sessionId) =>
  handleApiCall(() => getSubjectWisePreviewApi(campusId, sessionId), 'Failed to fetch subject timetable preview')

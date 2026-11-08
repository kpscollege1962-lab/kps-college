import { handleApiCall } from '@/lib/apiUtils'
import {
  getMyTimetableApi,
  listMyAssignmentsApi,
  createAssignmentBatchApi,
} from '../api/teacherWorkspace.api'

export const getMyTimetableService = (campusId) =>
  handleApiCall(() => getMyTimetableApi(campusId), 'Failed to load your timetable')

export const listMyAssignmentsService = (campusId, params) =>
  handleApiCall(() => listMyAssignmentsApi(campusId, params), 'Failed to load assignments')

export const createAssignmentBatchService = (campusId, data) =>
  handleApiCall(() => createAssignmentBatchApi(campusId, data), 'Failed to save the assignment')
import { handleApiCall } from '@/lib/apiUtils'
import {
  getMyTimetableApi,
  listMyAssignmentsApi,
  createAssignmentBatchApi,
  listMyFormMasterClassesApi,
  getFormMasterReportApi,
} from '../api/teacherWorkspace.api'

export const getMyTimetableService = (campusId) =>
  handleApiCall(() => getMyTimetableApi(campusId), 'Failed to load your timetable')

export const listMyAssignmentsService = (campusId, params) =>
  handleApiCall(() => listMyAssignmentsApi(campusId, params), 'Failed to load assignments')

export const createAssignmentBatchService = (campusId, data) =>
  handleApiCall(() => createAssignmentBatchApi(campusId, data), 'Failed to save the assignment')

export const listMyFormMasterClassesService = (campusId) =>
  handleApiCall(() => listMyFormMasterClassesApi(campusId), 'Failed to load your form-master classes')

export const getFormMasterReportService = (campusId, params) =>
  handleApiCall(() => getFormMasterReportApi(campusId, params), 'Failed to load the class report')

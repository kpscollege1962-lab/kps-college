import { handleApiCall } from '@/lib/apiUtils'
import {
  listAssignmentsApi,
  addAssignmentApi,
  removeAssignmentApi,
  searchCampusStaffApi,
} from '../api/classTeacherAssignments.api'

export const listAssignmentsService  = (campusId, params) =>
  handleApiCall(() => listAssignmentsApi(campusId, params),         'Failed to fetch class teacher assignments')

export const addAssignmentService    = (campusId, data)   =>
  handleApiCall(() => addAssignmentApi(campusId, data),             'Failed to add assignment')

export const removeAssignmentService = (campusId, assignmentId) =>
  handleApiCall(() => removeAssignmentApi(campusId, assignmentId),  'Failed to remove assignment')

export const searchCampusStaffService = (campusId, params) =>
  handleApiCall(() => searchCampusStaffApi(campusId, params),       'Failed to search staff')

import { handleApiCall } from '@/lib/apiUtils'
import {
  getAssignmentsOverviewApi, getAssignmentsStructureApi, listCampusesApi,
  getDeletedAssignmentsApi, adminUpdateAssignmentApi, adminDeleteAssignmentApi,
  adminRestoreAssignmentApi, adminPurgeAssignmentApi,
} from '../api/assignments.api'

export const getAssignmentsOverviewService = (campusId, params) =>
  handleApiCall(() => getAssignmentsOverviewApi(campusId, params), 'Failed to fetch assignments')

export const getAssignmentsStructureService = (campusId, params) =>
  handleApiCall(() => getAssignmentsStructureApi(campusId, params), 'Failed to fetch class and teacher details')

export const listCampusesService = () =>
  handleApiCall(() => listCampusesApi(), 'Failed to fetch campuses')

export const getDeletedAssignmentsService = (campusId, params) =>
  handleApiCall(() => getDeletedAssignmentsApi(campusId, params), 'Failed to fetch deleted assignments')

export const adminUpdateAssignmentService = (campusId, homeworkId, data) =>
  handleApiCall(() => adminUpdateAssignmentApi(campusId, homeworkId, data), 'Failed to update the assignment')

export const adminDeleteAssignmentService = (campusId, homeworkId) =>
  handleApiCall(() => adminDeleteAssignmentApi(campusId, homeworkId), 'Failed to delete the assignment')

export const adminRestoreAssignmentService = (campusId, homeworkId) =>
  handleApiCall(() => adminRestoreAssignmentApi(campusId, homeworkId), 'Failed to restore the assignment')

export const adminPurgeAssignmentService = (campusId, homeworkId) =>
  handleApiCall(() => adminPurgeAssignmentApi(campusId, homeworkId), 'Failed to delete the assignment permanently')

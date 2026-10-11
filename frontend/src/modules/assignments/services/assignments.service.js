import { handleApiCall } from '@/lib/apiUtils'
import { getAssignmentsOverviewApi, getAssignmentsStructureApi, listCampusesApi } from '../api/assignments.api'

export const getAssignmentsOverviewService = (campusId, params) =>
  handleApiCall(() => getAssignmentsOverviewApi(campusId, params), 'Failed to fetch assignments')

export const getAssignmentsStructureService = (campusId, params) =>
  handleApiCall(() => getAssignmentsStructureApi(campusId, params), 'Failed to fetch class and teacher details')

export const listCampusesService = () =>
  handleApiCall(() => listCampusesApi(), 'Failed to fetch campuses')
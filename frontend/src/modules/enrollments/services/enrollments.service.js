import { handleApiCall } from '@/lib/apiUtils'
import {
  listEnrollmentsApi,
  getEnrollmentApi,
  createEnrollmentApi,
  deleteEnrollmentApi,
  searchEligibleStudentsApi,
} from '../api/enrollments.api'

export const listEnrollmentsService = (params) =>
  handleApiCall(() => listEnrollmentsApi(params), 'Failed to fetch enrollments')

export const getEnrollmentService = (enrollmentId) =>
  handleApiCall(() => getEnrollmentApi(enrollmentId), 'Failed to fetch enrollment')

export const createEnrollmentService = (data) =>
  handleApiCall(() => createEnrollmentApi(data), 'Failed to create enrollment')

export const deleteEnrollmentService = (enrollmentId) =>
  handleApiCall(() => deleteEnrollmentApi(enrollmentId), 'Failed to delete enrollment')

export const searchEligibleStudentsService = (params) =>
  handleApiCall(() => searchEligibleStudentsApi(params), 'Failed to search students')

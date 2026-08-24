import { handleApiCall } from '@/lib/apiUtils'
import {
  listAcademicSessionsApi,
  createAcademicSessionApi,
  updateAcademicSessionApi,
  transitionAcademicSessionApi,
  deleteAcademicSessionApi,
} from '../api/academicSessions.api'

export const listAcademicSessionsService = (params) =>
  handleApiCall(() => listAcademicSessionsApi(params), 'Failed to fetch academic sessions')

export const createAcademicSessionService = (data) =>
  handleApiCall(() => createAcademicSessionApi(data), 'Failed to create academic session')

export const updateAcademicSessionService = (id, data) =>
  handleApiCall(() => updateAcademicSessionApi(id, data), 'Failed to update academic session')

export const transitionAcademicSessionService = (id) =>
  handleApiCall(() => transitionAcademicSessionApi(id), 'Failed to transition academic session')

export const deleteAcademicSessionService = (id) =>
  handleApiCall(() => deleteAcademicSessionApi(id), 'Failed to delete academic session')

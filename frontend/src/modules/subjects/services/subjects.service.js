import { handleApiCall } from '@/lib/apiUtils'
import {
  listSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
} from '../api/subjects.api'

export const listSubjectsService = (params) =>
  handleApiCall(() => listSubjectsApi(params), 'Failed to fetch subjects')

export const createSubjectService = (data) =>
  handleApiCall(() => createSubjectApi(data), 'Failed to create subject')

export const updateSubjectService = (subjectId, data) =>
  handleApiCall(() => updateSubjectApi(subjectId, data), 'Failed to update subject')

export const deleteSubjectService = (subjectId) =>
  handleApiCall(() => deleteSubjectApi(subjectId), 'Failed to delete subject')

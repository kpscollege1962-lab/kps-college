import { handleApiCall } from '@/lib/apiUtils'
import {
  listHomeworkApi, getHomeworkApi, createHomeworkApi, updateHomeworkApi, deleteHomeworkApi,
  listSubmissionsApi, markSubmissionDoneApi, submitHomeworkApi,
} from '../api/homework.api'

export const listHomeworkService  = (campusId, params) =>
  handleApiCall(() => listHomeworkApi(campusId, params), 'Failed to fetch homework')

export const getHomeworkService   = (campusId, homeworkId) =>
  handleApiCall(() => getHomeworkApi(campusId, homeworkId), 'Failed to fetch homework')

export const createHomeworkService = (campusId, formData) =>
  handleApiCall(() => createHomeworkApi(campusId, formData), 'Failed to post homework')

export const updateHomeworkService = (campusId, homeworkId, formData) =>
  handleApiCall(() => updateHomeworkApi(campusId, homeworkId, formData), 'Failed to update homework')

export const deleteHomeworkService = (campusId, homeworkId) =>
  handleApiCall(() => deleteHomeworkApi(campusId, homeworkId), 'Failed to delete homework')

export const listSubmissionsService = (campusId, homeworkId) =>
  handleApiCall(() => listSubmissionsApi(campusId, homeworkId), 'Failed to fetch submissions')

export const markSubmissionDoneService = (campusId, homeworkId, submissionId) =>
  handleApiCall(() => markSubmissionDoneApi(campusId, homeworkId, submissionId), 'Failed to update submission')

export const submitHomeworkService = (campusId, homeworkId, formData) =>
  handleApiCall(() => submitHomeworkApi(campusId, homeworkId, formData), 'Failed to submit homework')
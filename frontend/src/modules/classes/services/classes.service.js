import { handleApiCall } from '@/lib/apiUtils'
import {
  listClassesApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  seedDefaultClassesApi,
  cloneClassesApi,
} from '../api/classes.api'

export const listClassesService        = (campusId, params) =>
  handleApiCall(() => listClassesApi(campusId, params),             'Failed to fetch classes')

export const createClassService        = (campusId, data) =>
  handleApiCall(() => createClassApi(campusId, data),               'Failed to create class')

export const updateClassService        = (campusId, classGroupId, data) =>
  handleApiCall(() => updateClassApi(campusId, classGroupId, data), 'Failed to update class')

export const deleteClassService        = (campusId, classGroupId) =>
  handleApiCall(() => deleteClassApi(campusId, classGroupId),       'Failed to delete class')

export const seedDefaultClassesService = (campusId, data) =>
  handleApiCall(() => seedDefaultClassesApi(campusId, data),        'Failed to seed default classes')

export const cloneClassesService       = (campusId, data) =>
  handleApiCall(() => cloneClassesApi(campusId, data),              'Failed to clone classes')

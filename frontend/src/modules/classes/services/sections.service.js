import { handleApiCall } from '@/lib/apiUtils'
import {
  listSectionsApi,
  addSectionApi,
  updateSectionApi,
  deleteSectionApi,
} from '../api/sections.api'

export const listSectionsService   = (campusId, classGroupId) =>
  handleApiCall(() => listSectionsApi(campusId, classGroupId),                   'Failed to fetch sections')

export const addSectionService     = (campusId, classGroupId, data) =>
  handleApiCall(() => addSectionApi(campusId, classGroupId, data),               'Failed to add section')

export const updateSectionService  = (campusId, classGroupId, sectionId, data) =>
  handleApiCall(() => updateSectionApi(campusId, classGroupId, sectionId, data), 'Failed to update section')

export const deleteSectionService  = (campusId, classGroupId, sectionId) =>
  handleApiCall(() => deleteSectionApi(campusId, classGroupId, sectionId),       'Failed to delete section')

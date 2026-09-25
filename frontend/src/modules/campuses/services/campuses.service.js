import { handleApiCall } from '@/lib/apiUtils'
import {
  listCampusesApi,
  getCampusApi,
  createCampusApi,
  updateCampusApi,
  uploadCampusBrandingApi,
  removeCampusBrandingApi,
} from '../api/campuses.api'

export const listCampusesService = (params) =>
  handleApiCall(() => listCampusesApi(params), 'Failed to fetch campuses')

export const getCampusService = (id) =>
  handleApiCall(() => getCampusApi(id), 'Failed to fetch campus')

export const createCampusService = (data) =>
  handleApiCall(() => createCampusApi(data), 'Failed to create campus')

export const updateCampusService = (id, data) =>
  handleApiCall(() => updateCampusApi(id, data), 'Failed to update campus')

export const uploadCampusBrandingService = (id, field, file) =>
  handleApiCall(() => uploadCampusBrandingApi(id, field, file), 'Failed to upload image')

export const removeCampusBrandingService = (id, field) =>
  handleApiCall(() => removeCampusBrandingApi(id, field), 'Failed to remove image')
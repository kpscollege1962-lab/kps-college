import { handleApiCall } from '@/lib/apiUtils'
import { getCampusSettingsApi, updateCampusSettingsApi, uploadBrandingImageApi } from '../api/campus-settings.api'

export const getCampusSettingsService = (campusId) =>
  handleApiCall(() => getCampusSettingsApi(campusId), 'Failed to fetch campus settings')

export const updateCampusSettingsService = (campusId, data) =>
  handleApiCall(() => updateCampusSettingsApi(campusId, data), 'Failed to update campus settings')

export const uploadBrandingImageService = (campusId, field, file) =>
  handleApiCall(() => uploadBrandingImageApi(campusId, field, file), 'Failed to upload image')

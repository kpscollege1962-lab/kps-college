import { handleApiCall } from '@/lib/apiUtils'
import { getCampusSettingsApi, updateCampusSettingsApi } from '../api/campus-settings.api'

export const getCampusSettingsService = (campusId) =>
  handleApiCall(() => getCampusSettingsApi(campusId), 'Failed to fetch campus settings')

export const updateCampusSettingsService = (campusId, data) =>
  handleApiCall(() => updateCampusSettingsApi(campusId, data), 'Failed to update campus settings')

import { handleApiCall } from '@/lib/apiUtils'
import { getSchoolSettingsApi, updateSchoolSettingsApi } from '../api/school-settings.api'

export const getSchoolSettingsService = () =>
  handleApiCall(() => getSchoolSettingsApi(), 'Failed to fetch school settings')

export const updateSchoolSettingsService = (data) =>
  handleApiCall(() => updateSchoolSettingsApi(data), 'Failed to update school settings')

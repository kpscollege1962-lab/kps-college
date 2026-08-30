import { handleApiCall } from '@/lib/apiUtils'
import { getClassFeeSetupApi, assignClassFeesApi } from '../api/classFeeAssignment.api'

export const getClassFeeSetupService = (campusId, classGroupId, params) =>
  handleApiCall(() => getClassFeeSetupApi(campusId, classGroupId, params), 'Failed to fetch class fee setup')

export const assignClassFeesService = (campusId, classGroupId, data) =>
  handleApiCall(() => assignClassFeesApi(campusId, classGroupId, data), 'Failed to assign fees')
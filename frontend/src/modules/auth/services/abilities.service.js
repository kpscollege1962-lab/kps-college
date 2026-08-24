import { handleApiCall } from '@/lib/apiUtils'
import { fetchAbilitiesApi } from '../api/abilities.api'

export const fetchAbilitiesService = (roleId, campusId) =>
  handleApiCall(
    () => fetchAbilitiesApi(roleId, campusId),
    'Failed to load workspace abilities'
  )

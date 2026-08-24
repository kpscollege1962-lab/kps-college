import { handleApiCall } from '@/lib/apiUtils'
import {
  listStaffApi,
  getStaffApi,
  createStaffApi,
  updateStaffApi,
  updateStaffPostingApi,
  searchEligibleStaffApi,
  createStaffPostingApi,
} from '../api/staff.api'

export const listStaffService   = (campusId, params)       =>
  handleApiCall(() => listStaffApi(campusId, params),          'Failed to fetch staff')

export const getStaffService    = (campusId, staffId)       =>
  handleApiCall(() => getStaffApi(campusId, staffId),          'Failed to fetch staff member')

export const createStaffService = (campusId, data)          =>
  handleApiCall(() => createStaffApi(campusId, data),          'Failed to create staff member')

export const updateStaffService = (campusId, staffId, data) =>
  handleApiCall(() => updateStaffApi(campusId, staffId, data), 'Failed to update staff member')

export const updateStaffPostingService = (campusId, staffId, data) =>
  handleApiCall(
    () => updateStaffPostingApi(campusId, staffId, data),
    'Failed to update staff posting'
  )

export const searchEligibleStaffService = (campusId, params) =>
  handleApiCall(
    () => searchEligibleStaffApi(campusId, params),
    'Failed to search eligible staff'
  )

export const createStaffPostingService = (campusId, staffId, data) =>
  handleApiCall(
    () => createStaffPostingApi(campusId, staffId, data),
    'Failed to add staff member to campus'
  )

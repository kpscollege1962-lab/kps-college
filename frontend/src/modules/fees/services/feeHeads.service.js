import { handleApiCall } from '@/lib/apiUtils'
import {
  listFeeHeadsApi,
  createFeeHeadApi,
  updateFeeHeadApi,
  deleteFeeHeadApi,
} from '../api/feeHeads.api'

export const listFeeHeadsService  = (campusId, params) =>
  handleApiCall(() => listFeeHeadsApi(campusId, params),              'Failed to fetch fee heads')

export const createFeeHeadService = (campusId, data) =>
  handleApiCall(() => createFeeHeadApi(campusId, data),               'Failed to create fee head')

export const updateFeeHeadService = (campusId, feeHeadId, data) =>
  handleApiCall(() => updateFeeHeadApi(campusId, feeHeadId, data),    'Failed to update fee head')

export const deleteFeeHeadService = (campusId, feeHeadId) =>
  handleApiCall(() => deleteFeeHeadApi(campusId, feeHeadId),          'Failed to delete fee head')
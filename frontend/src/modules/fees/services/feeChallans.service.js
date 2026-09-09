import { handleApiCall } from '@/lib/apiUtils'
import { listChallansApi, getChallanApi, cancelChallanApi } from '../api/feeChallans.api'

export const listChallansService  = (campusId, params)    =>
  handleApiCall(() => listChallansApi(campusId, params),      'Failed to fetch fee challans')

export const getChallanService    = (campusId, challanId) =>
  handleApiCall(() => getChallanApi(campusId, challanId),     'Failed to fetch fee challan')

export const cancelChallanService = (campusId, challanId) =>
  handleApiCall(() => cancelChallanApi(campusId, challanId),  'Failed to cancel fee challan')
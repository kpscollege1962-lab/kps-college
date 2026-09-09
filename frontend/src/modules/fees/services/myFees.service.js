import { handleApiCall } from '@/lib/apiUtils'
import { listMyFeeChallansApi } from '../api/myFees.api'

export const listMyFeeChallansService = () =>
  handleApiCall(() => listMyFeeChallansApi(), 'Failed to fetch your fee challans')
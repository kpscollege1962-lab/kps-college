import api from '@/lib/api'

export const listMyFeeChallansApi = () => api.get('/me/fee-challans')
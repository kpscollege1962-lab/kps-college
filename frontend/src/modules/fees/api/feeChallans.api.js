import api from '@/lib/api'

const base = (campusId) => `/campuses/${campusId}/fee-challans`

export const listChallansApi  = (campusId, params)  => api.get(base(campusId), { params })
export const getChallanApi    = (campusId, challanId) => api.get(`${base(campusId)}/${challanId}`)
export const cancelChallanApi = (campusId, challanId) => api.patch(`${base(campusId)}/${challanId}/cancel`)
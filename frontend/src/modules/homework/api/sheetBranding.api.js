import api from '@/lib/api'

export const getSheetBrandingApi = (campusId) => api.get(`/campuses/${campusId}/homework/branding`)
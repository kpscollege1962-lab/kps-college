import api from '@/lib/api'

export const getPrintBrandingApi = (campusId) => api.get(`/campuses/${campusId}/print-branding`)
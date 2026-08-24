import api from '@/lib/api'

const base = (campusId, classGroupId) => `/campuses/${campusId}/classes/${classGroupId}/sections`

export const listSectionsApi   = (campusId, classGroupId)                    => api.get(base(campusId, classGroupId))
export const addSectionApi     = (campusId, classGroupId, data)              => api.post(base(campusId, classGroupId), data)
export const updateSectionApi  = (campusId, classGroupId, sectionId, data)  => api.patch(`${base(campusId, classGroupId)}/${sectionId}`, data)
export const deleteSectionApi  = (campusId, classGroupId, sectionId)        => api.delete(`${base(campusId, classGroupId)}/${sectionId}`)

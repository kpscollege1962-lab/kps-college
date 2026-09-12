import api from '@/lib/api'

export const getCampusSettingsApi = (campusId) =>
  api.get(`/campuses/${campusId}/settings`)

export const updateCampusSettingsApi = (campusId, data) =>
  api.patch(`/campuses/${campusId}/settings`, data)

// field must be one of: title_english_url, title_urdu_url, title_combined_url, watermark_url
export const uploadBrandingImageApi = (campusId, field, file) => {
  const formData = new FormData()
  formData.append('field', field)
  formData.append('image', file)
  return api.post(`/campuses/${campusId}/settings/branding/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

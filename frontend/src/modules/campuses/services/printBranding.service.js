import { handleApiCall } from '@/lib/apiUtils'
import { getPrintBrandingApi } from '../api/printBranding.api'

// Cloudinary URLs are absolute and pass through unchanged. Only a plain local path
// (old "/uploads/..." data, if any) gets VITE_API_ORIGIN prefixed.
const assetUrl = (p) =>
  !p ? null : /^https?:\/\//i.test(p) ? p : `${import.meta.env.VITE_API_ORIGIN ?? ''}${p}`

export const getPrintBrandingService = async (campusId) => {
  const result = await handleApiCall(() => getPrintBrandingApi(campusId), 'Failed to load print branding')
  if (!result.success) return result

  const b = result.data.branding
  return {
    ...result,
    data: {
      branding: {
        timetableTitleUrl:  assetUrl(b.timetableTitleUrl),
        assignmentTitleUrl: assetUrl(b.assignmentTitleUrl),
        watermarkUrl:       assetUrl(b.watermarkUrl),
        footerText:         b.footerText ?? null,
      },
    },
  }
}
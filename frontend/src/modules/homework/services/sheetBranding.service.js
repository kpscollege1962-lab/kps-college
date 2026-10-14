import { handleApiCall } from '@/lib/apiUtils'
import { getSheetBrandingApi } from '../api/sheetBranding.api'

const assetUrl = (p) =>
  !p ? null : /^https?:\/\//i.test(p) ? p : `${import.meta.env.VITE_API_ORIGIN ?? ''}${p}`

export const getSheetBrandingService = async (campusId) => {
  const result = await handleApiCall(() => getSheetBrandingApi(campusId), 'Failed to load sheet branding')
  if (!result.success) return result

  const { titleUrl, watermarkUrl } = result.data.branding
  return {
    ...result,
    data: { branding: { titleUrl: assetUrl(titleUrl), watermarkUrl: assetUrl(watermarkUrl) } },
  }
}
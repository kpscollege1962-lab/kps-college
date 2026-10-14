import { useEffect, useState } from 'react'
import { getSheetBrandingService } from '../services/sheetBranding.service'

const NONE = { titleUrl: null, watermarkUrl: null }

export const useSheetBranding = (campusId, enabled = true) => {
  const [branding, setBranding] = useState(NONE)

  useEffect(() => {
    if (!enabled || !campusId) return
    let cancelled = false
    getSheetBrandingService(campusId).then((result) => {
      if (!cancelled) setBranding(result.success ? result.data.branding : NONE)
    })
    return () => { cancelled = true }
  }, [campusId, enabled])

  return branding
}
import { useState, useEffect } from 'react'
import { getCampusService } from '@/modules/campuses/services/campuses.service'

// Same rule as CampusForm: with the Vite /uploads proxy leave VITE_API_ORIGIN unset,
// otherwise set it to the backend origin (e.g. http://localhost:5001).
const assetUrl = (p) => (p ? `${import.meta.env.VITE_API_ORIGIN ?? ''}${p}` : null)

// Reads the campus's printed-timetable branding (set on the Campuses page):
//   titleUrl     → the image for the campus's active title variant (or null)
//   watermarkUrl → the campus watermark (or null)
export const useCampusPrintBranding = (campusId) => {
  const [branding, setBranding] = useState({ titleUrl: null, watermarkUrl: null })

  useEffect(() => {
    if (!campusId) return
    let alive = true

    getCampusService(campusId).then((r) => {
      if (!alive || !r.success) return
      const c = r.data.campus
      const variant = c.active_title_variant // 'english' | 'urdu' | 'combined' | null
      setBranding({
        titleUrl: assetUrl(variant ? c[`title_${variant}_url`] : null),
        watermarkUrl: assetUrl(c.watermark_url),
      })
    })

    return () => { alive = false }
  }, [campusId])

  return branding
}
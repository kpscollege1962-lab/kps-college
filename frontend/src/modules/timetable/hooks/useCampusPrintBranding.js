import { useState, useEffect } from 'react'
import { getCampusService } from '@/modules/campuses/services/campuses.service'

// Cloudinary URLs are already absolute (https://res.cloudinary.com/...) and pass
// through unchanged. Only a plain local path (old "/uploads/..." data, if any)
// gets VITE_API_ORIGIN prefixed onto it.
const assetUrl = (p) =>
  !p ? null : /^https?:\/\//i.test(p) ? p : `${import.meta.env.VITE_API_ORIGIN ?? ''}${p}`

// Reads the campus's printed-timetable branding (set on the Campuses page):
//   titleUrl     → the image for the campus's active title variant (or null)
//   watermarkUrl → the campus watermark (or null)
//   footerText   → free text shown at the bottom of the printout (or null)
export const useCampusPrintBranding = (campusId) => {
  const [branding, setBranding] = useState({ titleUrl: null, watermarkUrl: null, footerText: null })

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
        footerText: c.footer_text || null,
      })
    })

    return () => { alive = false }
  }, [campusId])

  return branding
}
import { useState, useEffect, useCallback } from 'react'
import {
  getCampusService,
  uploadCampusBrandingService,
  removeCampusBrandingService,
} from '../services/campuses.service'

const KEYS = ['title_english_url', 'title_urdu_url', 'title_combined_url', 'watermark_url']
const pick = (c) => Object.fromEntries(KEYS.map((k) => [k, c?.[k] ?? null]))

export const useCampusBranding = (campusId, initialCampus) => {
  const [branding, setBranding] = useState(pick(initialCampus))
  const [busyField, setBusyField] = useState(null)
  const [error, setError] = useState(null)

  // Always show fresh data, even if the list row is stale
  useEffect(() => {
    let alive = true
    getCampusService(campusId).then((r) => {
      if (alive && r.success) setBranding(pick(r.data.campus))
    })
    return () => { alive = false }
  }, [campusId])

  const run = useCallback(async (field, fn) => {
    setBusyField(field)
    setError(null)
    const result = await fn()
    setBusyField(null)
    if (result.success) setBranding(pick(result.data.campus))
    else setError(result.message)
  }, [])

  const upload = (field, file) => run(field, () => uploadCampusBrandingService(campusId, field, file))
  const clear  = (field)       => run(field, () => removeCampusBrandingService(campusId, field))

  return { branding, busyField, error, upload, clear }
}
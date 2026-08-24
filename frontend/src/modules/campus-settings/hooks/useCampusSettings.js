import { useState, useCallback } from 'react'
import { getCampusSettingsService, updateCampusSettingsService } from '../services/campus-settings.service'

export const useCampusSettings = () => {
  const [settings, setSettings]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState(null)

  const fetchSettings = useCallback(async (campusId) => {
    setLoading(true)
    setError(null)

    const result = await getCampusSettingsService(campusId)

    setLoading(false)

    if (result.success) {
      setSettings(result.data)
    } else {
      setError(result.message)
    }
  }, [])

  const updateSettings = useCallback(async (campusId, data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateCampusSettingsService(campusId, data)

    setSaving(false)

    if (!result.success) {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [])

  return { settings, loading, error, saving, saveError, fetchSettings, updateSettings }
}

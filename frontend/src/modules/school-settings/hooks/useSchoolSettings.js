import { useState, useCallback } from 'react'
import { getSchoolSettingsService, updateSchoolSettingsService } from '../services/school-settings.service'

export const useSchoolSettings = () => {
  const [settings, setSettings]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getSchoolSettingsService()

    setLoading(false)

    if (result.success) {
      setSettings(result.data.settings)
    } else {
      setError(result.message)
    }
  }, [])

  const updateSettings = useCallback(async (data) => {
    setSaving(true)
    setSaveError(null)

    const result = await updateSchoolSettingsService(data)

    setSaving(false)

    if (result.success) {
      setSettings(result.data.settings)
    } else {
      setSaveError(result.message)
    }

    return { success: result.success, message: result.message, data: result.data }
  }, [])

  return { settings, loading, error, saving, saveError, fetchSettings, updateSettings }
}

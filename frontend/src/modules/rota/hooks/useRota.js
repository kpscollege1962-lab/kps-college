import { useCallback, useEffect, useState } from 'react'
import { getRotaService, saveRotaService, deleteRotaService } from '../services/rota.service'

// The rota of one campus for one date: { date, status: null | 'draft' | 'issued', issuedAt,
// issuedBy, absentStaffIds, entries }. `enabled` = the viewer may read it (read Rota).
export const useRota = (campusId, date, enabled = true) => {
  const [rota, setRota] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !campusId || !date) return
    let alive = true
    getRotaService(campusId, date).then((result) => {
      if (!alive) return
      setLoading(false)
      if (result.success) { setRota(result.data.rota); setError(null) }
      else setError(result.message)
    })
    return () => { alive = false }
  }, [campusId, date, enabled])

  const save = useCallback(async (data) => {
    setSaving(true)
    const result = await saveRotaService(campusId, date, data)
    setSaving(false)
    if (result.success) setRota(result.data.rota)
    return result
  }, [campusId, date])

  const remove = useCallback(async () => {
    setSaving(true)
    const result = await deleteRotaService(campusId, date)
    setSaving(false)
    if (result.success) setRota({ date, status: null, issuedAt: null, issuedBy: null, absentStaffIds: [], entries: [] })
    return result
  }, [campusId, date])

  return { rota, loading, saving, error, save, remove }
}

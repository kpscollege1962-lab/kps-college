import { useCallback, useEffect, useState } from 'react'
import { getRegisterService, saveRegisterService, reopenSessionService } from '../services/attendance.service'

const messageOf = (result) => {
  const fieldErrors = result.data?.errors?.fieldErrors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return Object.values(fieldErrors).join(' • ')
  return result.message
}

// One class's attendance on one date: { class, date, session, formMasterNames, students, records,
// editable, lockedReason, lockedMessage, canSubmit, canReopen } (+ contacts for admin readers).
// Reading never creates anything; `save` creates the day's register on its first save.
export const useClassRegister = (campusId, sectionId, date) => {
  const key = campusId && sectionId && date ? `${campusId}|${sectionId}|${date}` : null
  const [state, setState] = useState({ key: null, register: null, error: null })
  const [nonce, setNonce] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!key) return undefined
    let alive = true
    getRegisterService(campusId, { sectionId, date }).then((result) => {
      if (!alive) return
      setState(result.success
        ? { key, register: result.data, error: null }
        : { key, register: null, error: messageOf(result) })
    })
    return () => { alive = false }
  }, [key, nonce, campusId, sectionId, date])

  const save = useCallback(async ({ records, submit = false }) => {
    setSaving(true)
    const result = await saveRegisterService(campusId, { sectionId, date, records, submit })
    setSaving(false)
    if (result.success) setState({ key, register: result.data, error: null })
    return { ...result, message: result.success ? result.message : messageOf(result) }
  }, [campusId, sectionId, date, key])

  const reopen = useCallback(async (attendanceSessionId) => {
    setSaving(true)
    const result = await reopenSessionService(campusId, attendanceSessionId)
    setSaving(false)
    if (result.success) setNonce((n) => n + 1)
    return { ...result, message: result.success ? result.message : messageOf(result) }
  }, [campusId])

  const current = state.key === key
  return {
    register: current ? state.register : null,
    error: current ? state.error : null,
    loading: Boolean(key) && !current,
    saving,
    save,
    reopen,
    reload: useCallback(() => setNonce((n) => n + 1), []),
  }
}

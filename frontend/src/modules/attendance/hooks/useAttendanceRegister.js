import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getOrCreateSessionService,
  saveRecordsService,
  submitSessionService,
  reopenSessionService,
} from '../services/attendance.service'

const extractErrorMessage = (result) => {
  const fieldErrors = result.data?.errors?.fieldErrors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors).join(' • ')
  }
  return result.message
}

export const useAttendanceRegister = (campusId, { sectionId, classGroupId, date }) => {
  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [editable, setEditable] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [reopening, setReopening] = useState(false)
  const [reopenError, setReopenError] = useState(null)

  const paramsRef = useRef({ sectionId, classGroupId, date })
  paramsRef.current = { sectionId, classGroupId, date }

  const openRegister = useCallback(async () => {
    const { sectionId: sId, classGroupId: cgId, date: d } = paramsRef.current
    if (!d || (!sId && !cgId)) return { success: false }

    setLoading(true)
    setError(null)

    const result = await getOrCreateSessionService(campusId, {
      date: d,
      ...(sId ? { sectionId: sId } : { classGroupId: cgId }),
    })

    setLoading(false)

    if (result.success) {
      const { session: newSession, students: newStudents, records: existingRecords, editable: isEditable } = result.data
      setSession(newSession)
      setStudents(newStudents)
      setEditable(isEditable)

      const recordsMap = {}
      newStudents.forEach((student) => {
        recordsMap[student.studentId] = { status: null, remarks: '' }
      })
      existingRecords.forEach((record) => {
        recordsMap[record.studentId] = { status: record.status, remarks: record.remarks ?? '' }
      })
      setRecords(recordsMap)
    } else {
      setError(extractErrorMessage(result))
    }

    return result
  }, [campusId])

  useEffect(() => {
    if (date && (sectionId || classGroupId)) {
      openRegister()
    }
  }, [sectionId, classGroupId, date]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateRecord = useCallback((studentId, field, value) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }))
  }, [])

  const saveProgress = useCallback(async () => {
    if (!session) return { success: false }

    setSaving(true)
    setSaveError(null)
    const payload = Object.entries(records)
      .filter(([, record]) => record.status !== null)
      .map(([studentId, record]) => ({
        studentId: parseInt(studentId),
        status: record.status,
        ...(record.remarks ? { remarks: record.remarks } : {}),
      }))

    const result = await saveRecordsService(campusId, session.id, { records: payload })
    setSaving(false)
    if (!result.success) setSaveError(extractErrorMessage(result))
    return result
  }, [campusId, session, records])

  const submitRegister = useCallback(async () => {
    if (!session) return { success: false }

    setSubmitting(true)
    setSubmitError(null)

    const payload = Object.entries(records)
      .filter(([, record]) => record.status !== null)
      .map(([studentId, record]) => ({
        studentId: parseInt(studentId),
        status: record.status,
        ...(record.remarks ? { remarks: record.remarks } : {}),
      }))

    const saveResult = await saveRecordsService(campusId, session.id, { records: payload })
    if (!saveResult.success) {
      setSubmitting(false)
      setSubmitError(extractErrorMessage(saveResult))
      return saveResult
    }

    const result = await submitSessionService(campusId, session.id)
    setSubmitting(false)

    if (result.success) {
      setSession((prev) => ({ ...prev, status: 'submitted' }))
      setEditable(false)
    } else {
      setSubmitError(extractErrorMessage(result))
    }

    return result
  }, [campusId, session, records])

  const reopenRegister = useCallback(async () => {
    if (!session) return { success: false }

    setReopening(true)
    setReopenError(null)

    const result = await reopenSessionService(campusId, session.id)
    setReopening(false)

    if (result.success) {
      setSession((prev) => ({ ...prev, status: 'draft', submittedAt: null }))
      setEditable(true)
    } else {
      setReopenError(extractErrorMessage(result))
    }

    return result
  }, [campusId, session])

  return {
    session, students, records, editable,
    loading, error,
    saving, saveError,
    submitting, submitError,
    reopening, reopenError,
    updateRecord, saveProgress, submitRegister, reopenRegister,
  }
}

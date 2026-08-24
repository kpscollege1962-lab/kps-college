import { useState, useCallback } from 'react'
import { getStatusListReportService } from '../services/attendanceReports.service'
import { updateRemarksService } from '../services/attendance.service'

const extractErrorMessage = (result) => {
  const fieldErrors = result.data?.errors?.fieldErrors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors).join(' • ')
  }
  return result.message
}

export const useStatusListReport = (campusId) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)

  const generateReport = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    const result = await getStatusListReportService(campusId, params)
    setLoading(false)
    setGenerated(true)
    if (result.success) {
      setRecords(result.data.records)
    } else {
      setError(extractErrorMessage(result))
    }
    return result
  }, [campusId])

  const updateRecordRemarks = useCallback(async (recordId, remarks) => {
    const result = await updateRemarksService(campusId, recordId, { remarks })
    if (result.success) {
      setRecords((prev) => prev.map((r) => (
        r.recordId === recordId ? { ...r, remarks: result.data.record.remarks } : r
      )))
      return { success: true }
    }
    return { success: false, message: extractErrorMessage(result) }
  }, [campusId])

  return {
    records, loading, error, generated, generateReport, updateRecordRemarks,
  }
}

import { useState, useCallback, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { listReportSectionsService, getClassRegisterReportService } from '../services/attendanceReports.service'

const extractErrorMessage = (result) => {
  const fieldErrors = result.data?.errors?.fieldErrors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.values(fieldErrors).join(' • ')
  }
  return result.message
}

export const useClassRegisterReport = (campusId) => {
  const [sections, setSections] = useState([])
  const [sectionsLoading, setSectionsLoading] = useState(false)

  const [report, setReport] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSections = useCallback(async (sessionId) => {
    if (!sessionId) return
    setSectionsLoading(true)
    const result = await listReportSectionsService(campusId, { sessionId })
    setSectionsLoading(false)
    if (result.success) setSections(result.data.sections)
  }, [campusId])

  const generateReport = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    const result = await getClassRegisterReportService(campusId, params)
    setLoading(false)
    setGenerated(true)
    if (result.success) {
      setReport(result.data.report)
    } else {
      setError(extractErrorMessage(result))
    }
    return result
  }, [campusId])

  const monthGroups = useMemo(() => {
    if (!report) return []

    const groupMap = new Map()
    report.dates.forEach((date) => {
      const d = parseISO(date)
      const key = format(d, 'yyyy-MM')
      if (!groupMap.has(key)) {
        groupMap.set(key, { key, label: format(d, 'MMMM yyyy'), dates: [] })
      }
      groupMap.get(key).dates.push(date)
    })

    // report.dates is already ascending-sorted (backend orders by date ASC), so
    // Map insertion order already preserves chronological month order — no extra sort needed.
    return Array.from(groupMap.values()).map((group) => ({
      ...group,
      students: report.students.map((student) => {
        const presentCount = group.dates.filter((d) => student.recordsByDate[d] === 'present').length
        const percentage = group.dates.length > 0
          ? Math.round((presentCount / group.dates.length) * 100)
          : 0
        return {
          studentId: student.studentId,
          grNo: student.grNo,
          studentName: student.studentName,
          recordsByDate: student.recordsByDate,
          percentage,
        }
      }),
    }))
  }, [report])

  return {
    sections, sectionsLoading, report, generated, loading, error, fetchSections, generateReport, monthGroups,
  }
}

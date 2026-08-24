import { useState, useCallback } from 'react'
import {
  getClassWisePreviewService,
  getStaffWisePreviewService,
  getSubjectWisePreviewService,
} from '../services/timetablePreview.service'

export const useTimetablePreview = () => {
  // class-wise
  const [classData, setClassData]     = useState(null)   // { periods, rows }
  const [classLoading, setClassLoading] = useState(false)
  const [classError, setClassError]   = useState(null)

  // staff-wise
  const [staffData, setStaffData]     = useState(null)   // array of staff entries
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError]   = useState(null)

  // subject-wise
  const [subjectData, setSubjectData]   = useState(null) // array of subject entries
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [subjectError, setSubjectError] = useState(null)

  const fetchClassWise = useCallback(async (campusId, sessionId) => {
    setClassLoading(true)
    setClassError(null)
    const result = await getClassWisePreviewService(campusId, sessionId)
    setClassLoading(false)
    if (result.success) {
      setClassData(result.data)
    } else {
      setClassError(result.message)
    }
  }, [])

  const fetchStaffWise = useCallback(async (campusId, sessionId) => {
    setStaffLoading(true)
    setStaffError(null)
    const result = await getStaffWisePreviewService(campusId, sessionId)
    setStaffLoading(false)
    if (result.success) {
      setStaffData(result.data.staff)
    } else {
      setStaffError(result.message)
    }
  }, [])

  const fetchSubjectWise = useCallback(async (campusId, sessionId) => {
    setSubjectLoading(true)
    setSubjectError(null)
    const result = await getSubjectWisePreviewService(campusId, sessionId)
    setSubjectLoading(false)
    if (result.success) {
      setSubjectData(result.data.subjects)
    } else {
      setSubjectError(result.message)
    }
  }, [])

  return {
    classData, classLoading, classError, fetchClassWise,
    staffData, staffLoading, staffError, fetchStaffWise,
    subjectData, subjectLoading, subjectError, fetchSubjectWise,
  }
}

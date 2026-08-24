import { handleApiCall } from '@/lib/apiUtils'
import { getStatusListReportApi, listReportSectionsApi, getClassRegisterReportApi } from '../api/attendanceReports.api'

export const getStatusListReportService = (campusId, params) =>
  handleApiCall(() => getStatusListReportApi(campusId, params), 'Failed to generate status list report')

export const listReportSectionsService = (campusId, params) =>
  handleApiCall(() => listReportSectionsApi(campusId, params), 'Failed to fetch sections')

export const getClassRegisterReportService = (campusId, params) =>
  handleApiCall(() => getClassRegisterReportApi(campusId, params), 'Failed to generate class register report')

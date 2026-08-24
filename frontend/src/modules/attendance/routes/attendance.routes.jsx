import { Navigate } from 'react-router'
import AttendanceLandingPage  from '../pages/AttendanceLandingPage'
import AttendanceRegisterPage from '../pages/AttendanceRegisterPage'
import ReportsLayout from '../components/ReportsLayout'
import StatusListReportPage from '../pages/StatusListReportPage'
import ClassRegisterReportPage from '../pages/ClassRegisterReportPage'

export const attendanceRoutes = [
  { index: true, element: <AttendanceLandingPage /> },
  { path: 'register', element: <AttendanceRegisterPage /> },
  {
    path: 'reports',
    element: <ReportsLayout />,
    children: [
      { index: true, element: <Navigate to="status-list" replace /> },
      { path: 'status-list', element: <StatusListReportPage /> },
      { path: 'class-register', element: <ClassRegisterReportPage /> },
    ],
  },
]

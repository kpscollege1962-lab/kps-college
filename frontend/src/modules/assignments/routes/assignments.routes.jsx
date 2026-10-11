import AssignmentCampusesPage from '../pages/AssignmentCampusesPage'
import AssignmentsPage from '../pages/AssignmentsPage'

export const assignmentRoutes = [
  { index: true, element: <AssignmentCampusesPage /> },
  { path: ':campusId', element: <AssignmentsPage /> },
]
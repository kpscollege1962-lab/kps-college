import { Navigate } from 'react-router'
import ManageClassesPage from '../pages/ManageClassesPage'
import MyClassLayout from '../components/MyClassLayout'
import MyClassStudentsPage from '../pages/MyClassStudentsPage'

export const myClassesRoutes = [
  { index: true, element: <ManageClassesPage /> },
  {
    path: ':classGroupId/:sectionId',
    element: <MyClassLayout />,
    children: [
      { index: true, element: <Navigate to="students" replace /> },
      { path: 'students', element: <MyClassStudentsPage /> },
    ],
  },
]
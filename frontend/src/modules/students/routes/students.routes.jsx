import StudentsPage         from '../pages/StudentsPage'
import StudentLayout        from '../components/StudentLayout'
import StudentProfilePage   from '../pages/StudentProfilePage'
import StudentRegistersPage from '../pages/StudentRegistersPage'

export const studentRoutes = [
  { index: true, element: <StudentsPage /> },
  {
    path: ':studentId',
    element: <StudentLayout />,
    children: [
      { index: true,       element: <StudentProfilePage />   },
      { path: 'registers', element: <StudentRegistersPage /> },
    ],
  },
]

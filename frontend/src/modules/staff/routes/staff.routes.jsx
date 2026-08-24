import StaffPage           from '../pages/StaffPage'
import StaffLayout         from '../components/StaffLayout'
import StaffProfilePage    from '../pages/StaffProfilePage'
import StaffEmploymentPage from '../pages/StaffEmploymentPage'

export const staffRoutes = [
  { index: true, element: <StaffPage /> },
  {
    path: ':staffId',
    element: <StaffLayout />,
    children: [
      { index: true,        element: <StaffProfilePage />    },
      { path: 'employment', element: <StaffEmploymentPage /> },
    ],
  },
]

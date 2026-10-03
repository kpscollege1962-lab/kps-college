import MyClassesIndexPage from '../pages/MyClassesIndexPage'
import MyClassLayout from '../components/MyClassLayout'
import MyClassStudentsPage from '../pages/MyClassStudentsPage'
import MyClassHomeworkPage from '../pages/MyClassHomeworkPage'

export const myClassesRoutes = [
  { index: true, element: <MyClassesIndexPage /> },
  {
    path: ':classGroupId/:sectionId',
    element: <MyClassLayout />,
    children: [
      { index: true, element: <MyClassStudentsPage /> },
      { path: 'students', element: <MyClassStudentsPage /> },
      { path: 'homework', element: <MyClassHomeworkPage /> },
    ],
  },
]
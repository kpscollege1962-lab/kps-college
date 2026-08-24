import TimetablePage        from '../pages/TimetablePage'
import TimetablePreviewPage from '../pages/TimetablePreviewPage'

export const timetableRoutes = [
  { index: true,      element: <TimetablePage /> },
  { path: 'preview',  element: <TimetablePreviewPage /> },
]

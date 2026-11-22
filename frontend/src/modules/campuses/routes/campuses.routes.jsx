import { Navigate } from 'react-router'

// The campus list now lives in Settings → Campus settings ("Campuses" tab).
// Old /portal/campuses links land there.
export const campusRoutes = [
  { index: true, element: <Navigate to="/portal/campus-settings?tab=campuses" replace /> },
]

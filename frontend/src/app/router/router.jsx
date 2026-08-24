import { createBrowserRouter } from 'react-router'
import { publicShellRoutes } from '@/shells/public/routes/publicShell.routes'
import { authShellRoutes } from '@/shells/auth/routes/authShell.routes'
import { portalShellRoutes } from '@/shells/portal/routes/portalShell.routes'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  publicShellRoutes,
  authShellRoutes,
  portalShellRoutes,
  {
    path: '*',
    element: <NotFoundPage />
  }
])

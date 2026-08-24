import AuthLayout from '@/shells/auth/layout/AuthLayout'
import { authRoutes } from '@/modules/auth/routes/auth.routes'

export const authShellRoutes = {
  path: '/auth',
  element: <AuthLayout />,
  children: authRoutes,
}

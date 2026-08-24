import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router'

export default function AuthGuard() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

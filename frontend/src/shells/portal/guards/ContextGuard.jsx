import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router'

// Requires an active role context before allowing access to the portal.
// If no context is set, redirects to the role selection page, preserving
// the intended destination so the user lands there after selecting a role.
export default function ContextGuard() {
  const activeRole = useSelector((state) => state.roleContext.activeRole)
  const location   = useLocation()

  if (!activeRole) {
    return (
      <Navigate
        to="/portal/select-role"
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}

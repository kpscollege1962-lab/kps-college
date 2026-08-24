import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
      <Outlet />
    </div>
  )
}

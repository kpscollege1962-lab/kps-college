import { Outlet } from 'react-router'
import Sidebar from './parts/Sidebar'
import Topbar from './parts/Topbar'

export default function PortalLayout() {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

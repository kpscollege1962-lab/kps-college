import { cn } from '@/lib/utils'
import usePortalLayout from '@/shells/portal/state/usePortalLayout'
import SidebarHeader from './SidebarHeader'
import SidebarNav from './SidebarNav'
import SidebarContext from '@/shells/portal/components/SidebarContext'
import SidebarSessionContext from '@/shells/portal/components/SidebarSessionContext'

export default function Sidebar() {
  const { sidebarOpen, mobileSidebarOpen, toggleSidebar, closeMobileSidebar } = usePortalLayout()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-border bg-sidebar h-dvh shrink-0',
        'transition-[width] duration-300 ease-in-out',
        sidebarOpen ? 'w-56' : 'w-14',
      )}>
        <SidebarHeader collapsed={!sidebarOpen} onToggle={toggleSidebar} />
        <SidebarContext collapsed={!sidebarOpen} />
        <SidebarSessionContext collapsed={!sidebarOpen} />
        <SidebarNav collapsed={!sidebarOpen} />
      </aside>

      {/* ── Mobile: backdrop + drawer ── */}
      {mobileSidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeMobileSidebar}
          />
          <aside className="fixed left-0 top-0 z-50 flex flex-col w-56 h-dvh bg-sidebar border-r border-border">
            <SidebarHeader collapsed={false} onClose={closeMobileSidebar} mobile />
            <SidebarContext collapsed={false} />
            <SidebarSessionContext collapsed={false} />
            <SidebarNav collapsed={false} onLinkClick={closeMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  )
}

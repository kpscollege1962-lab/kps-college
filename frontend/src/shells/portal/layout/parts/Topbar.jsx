import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import UserMenu from '@/shells/portal/components/UserMenu'
import usePortalLayout from '@/shells/portal/state/usePortalLayout'

export default function Topbar() {
  const { toggleMobileSidebar } = usePortalLayout()

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
      {/* Mobile: hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Desktop: spacer so right side aligns */}
      <div className="hidden md:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}

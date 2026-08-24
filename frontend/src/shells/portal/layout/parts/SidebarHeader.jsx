import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import APP_CONFIG from '@/lib/config'

export default function SidebarHeader({ collapsed, onToggle, onClose, mobile = false }) {
  return (
    <div className={cn(
      'flex items-center border-b border-border h-14 px-3 shrink-0',
      collapsed ? 'justify-center' : 'justify-between',
    )}>
      {!collapsed && (
        <span className="text-sm font-semibold text-foreground tracking-tight">
          {APP_CONFIG.APP_NAME}
        </span>
      )}
      {mobile ? (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      )}
    </div>
  )
}

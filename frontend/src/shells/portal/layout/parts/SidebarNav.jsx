import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { resolveNavConfig } from './navConfigs/index'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function SidebarNav({ collapsed, onLinkClick }) {
  const { activeRole } = useRoleContext()
  const navItems = resolveNavConfig(activeRole)

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
      {navItems.map(({ id, title, icon: Icon, path }) => {
        const link = (
          <NavLink
            key={id}
            to={path}
            end={path === '/portal'}
            onClick={onLinkClick}
            className={({ isActive }) => cn(
              'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm',
              'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
              isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{title}</span>}
          </NavLink>
        )

        if (!collapsed) return link

        return (
          <Tooltip key={id}>
            <TooltipTrigger render={<span className="flex w-full" />}>
              {link}
            </TooltipTrigger>
            <TooltipContent side="right">{title}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}

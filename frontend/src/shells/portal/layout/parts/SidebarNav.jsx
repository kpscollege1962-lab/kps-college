import { useState } from 'react'
import { NavLink } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resolveNavConfig } from './navConfigs/index'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useMyTeachingClasses } from '@/modules/my-classes/hooks/useMyTeachingClasses'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function SidebarNav({ collapsed, onLinkClick }) {
  const { activeRole } = useRoleContext()
  const navItems = resolveNavConfig(activeRole)
  const [expanded, setExpanded] = useState(() => new Set())

  const campusId = activeRole?.campusId
  const { classes: teachingClasses, fetchClasses: fetchTeachingClasses } = useMyTeachingClasses(campusId)

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (id === 'my-classes') fetchTeachingClasses()
      }
      return next
    })
  }

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
      {navItems.map(({ id, title, icon: Icon, path, dynamic }) => {
        const isDynamic = dynamic === 'teachingClasses'
        const isExpanded = expanded.has(id)

        if (isDynamic && !collapsed) {
          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => toggleExpand(id)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{title}</span>
                <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')} />
              </button>

              {isExpanded && (
                <div className="ml-6 flex flex-col gap-0.5 mt-0.5">
                  {teachingClasses.length === 0 && (
                    <span className="px-2 py-1.5 text-xs text-muted-foreground">No classes assigned</span>
                  )}
                  {teachingClasses.map((cls) => (
                    <NavLink
                      key={`${cls.classGroupId}-${cls.sectionId}`}
                      to={`/portal/my-classes/${cls.classGroupId}/${cls.sectionId}`}
                      onClick={onLinkClick}
                      className={({ isActive }) => cn(
                        'rounded-lg px-2 py-1.5 text-xs truncate',
                        'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
                        isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium',
                      )}
                    >
                      {cls.className}{cls.sectionName ? ` — ${cls.sectionName}` : ''}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        }

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
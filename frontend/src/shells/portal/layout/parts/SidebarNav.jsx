import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { resolveNavTree } from './navConfigs/masterNav'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Set to true to mark not-yet-built items with a small "Soon" tag in the sidebar.
const SHOW_SOON_TAG = false

const isPathActive = (pathname, path) =>
  path === '/portal' ? pathname === '/portal' : pathname === path || pathname.startsWith(`${path}/`)

const SoonTag = () => (
  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
    Soon
  </span>
)

// ids of the groups on the way to the entry that matches the current page (null = no match)
const activeTrail = (nodes, pathname) => {
  for (const node of nodes) {
    if (node.type === 'group') {
      const inner = activeTrail(node.items, pathname)
      if (inner) return [node.id, ...inner]
    } else if (node.type === 'item' && !node.noHighlight && isPathActive(pathname, node.path)) {
      return []
    }
  }
  return null
}

const flatten = (items) => items.flatMap((n) => (n.type === 'group' ? flatten(n.items) : [n]))

// For the collapsed sidebar's popup: loose entries, then one labelled section per sub-group.
const toSections = (items) => {
  const sections = []
  let loose = null
  for (const node of items) {
    if (node.type === 'group') {
      loose = null
      sections.push({ key: node.id, label: node.title, items: flatten(node.items) })
    } else {
      if (!loose) {
        loose = { key: `loose-${node.id}`, label: null, items: [] }
        sections.push(loose)
      }
      loose.items.push(node)
    }
  }
  return sections
}

// ── A top-level entry with an icon (Home, Campuses, My profile) ────────────────
function TopItem({ item, collapsed, onLinkClick }) {
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/portal'}
      onClick={onLinkClick}
      className={({ isActive }) => cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm',
        'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
        isActive && !item.noHighlight && 'bg-sidebar-accent text-sidebar-foreground font-medium',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="min-w-0 flex-1 leading-snug">{item.title}</span>}
      {!collapsed && SHOW_SOON_TAG && item.soon && <SoonTag />}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="flex w-full" />}>
        {link}
      </TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  )
}

// ── An entry inside a group ────────────────────────────────────────────────────
function ChildLink({ item, onLinkClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onLinkClick}
      className={({ isActive }) => cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug',
        'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
        isActive && !item.noHighlight && 'bg-sidebar-accent text-sidebar-foreground font-medium',
      )}
    >
      <span className="min-w-0 flex-1">{item.title}</span>
      {SHOW_SOON_TAG && item.soon && <SoonTag />}
    </NavLink>
  )
}

// ── A group inside a group (Classes, Lecture, Papers ...) ──────────────────────
function SubGroup({ group, openIds, trail, onToggle, onLinkClick }) {
  const open = openIds.has(group.id)

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug',
          'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
          trail.has(group.id) && 'text-sidebar-foreground font-medium',
        )}
      >
        <span className="min-w-0 flex-1 text-left">{group.title}</span>
        <ChevronRight className={cn('w-3 h-3 shrink-0 transition-transform', open && 'rotate-90')} />
      </button>

      {open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          <Children items={group.items} openIds={openIds} trail={trail} onToggle={onToggle} onLinkClick={onLinkClick} />
        </div>
      )}
    </div>
  )
}

function Children({ items, openIds, trail, onToggle, onLinkClick }) {
  return (
    <>
      {items.map((node) =>
        node.type === 'group' ? (
          <SubGroup key={node.id} group={node} openIds={openIds} trail={trail} onToggle={onToggle} onLinkClick={onLinkClick} />
        ) : (
          <ChildLink key={node.id} item={node} onLinkClick={onLinkClick} />
        )
      )}
    </>
  )
}

// ── A top-level group (Academics, Accounts / finance, Examination, Settings) ───
function Group({ group, collapsed, openIds, trail, onToggle, onLinkClick }) {
  const navigate = useNavigate()
  const Icon = group.icon
  const open = openIds.has(group.id)
  const hasActive = trail.has(group.id)

  // Collapsed sidebar: just the icon; clicking it pops the group's entries out to the side.
  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          title={group.title}
          className={cn(
            'flex w-full items-center justify-center rounded-lg py-2 outline-none',
            'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
            hasActive && 'bg-sidebar-accent text-sidebar-foreground',
          )}
        >
          <Icon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{group.title}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          {toSections(group.items).map((section) => (
            <DropdownMenuGroup key={section.key}>
              {section.label && (
                <DropdownMenuLabel className="font-normal">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{section.label}</p>
                </DropdownMenuLabel>
              )}
              {section.items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => { navigate(item.path); onLinkClick?.() }}
                >
                  <span className="whitespace-normal leading-snug">{item.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm',
          'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
          hasActive && 'text-sidebar-foreground font-medium',
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="min-w-0 flex-1 text-left leading-snug">{group.title}</span>
        <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
      </button>

      {open && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          <Children items={group.items} openIds={openIds} trail={trail} onToggle={onToggle} onLinkClick={onLinkClick} />
        </div>
      )}
    </div>
  )
}

export default function SidebarNav({ collapsed, onLinkClick }) {
  const { activeRole } = useRoleContext()
  const { pathname } = useLocation()
  const tree = useMemo(() => resolveNavTree(activeRole), [activeRole])
  const [openIds, setOpenIds] = useState(() => new Set())

  const trailIds = useMemo(() => activeTrail(tree, pathname) ?? [], [tree, pathname])
  const trail = useMemo(() => new Set(trailIds), [trailIds])
  const trailKey = trailIds.join('|')

  useEffect(() => {
    if (!trailIds.length) return
    setOpenIds((prev) => (trailIds.every((id) => prev.has(id)) ? prev : new Set([...prev, ...trailIds])))
  }, [trailKey]) 

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
      {tree.map((entry) => {
        if (entry.type === 'divider') {
          return <div key={entry.id} className="my-2 border-t border-border" />
        }
        if (entry.type === 'group') {
          return (
            <Group
              key={entry.id}
              group={entry}
              collapsed={collapsed}
              openIds={openIds}
              trail={trail}
              onToggle={toggle}
              onLinkClick={onLinkClick}
            />
          )
        }
        return <TopItem key={entry.id} item={entry} collapsed={collapsed} onLinkClick={onLinkClick} />
      })}
    </nav>
  )
}
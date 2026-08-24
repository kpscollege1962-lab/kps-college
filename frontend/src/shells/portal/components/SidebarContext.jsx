import { Building2, Globe, ChevronDown, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function SidebarContext({ collapsed }) {
  const navigate = useNavigate()
  const { activeRole, contexts, selectRole } = useRoleContext()
  const [switching, setSwitching] = useState(false)

  if (!activeRole) return null

  const isCampusRole = activeRole.layer === 'campus'
  const canSwitch    = contexts.length > 1

  const Icon = isCampusRole ? Building2 : Globe
  const primaryLabel   = isCampusRole ? (activeRole.campusName ?? `Campus #${activeRole.campusId}`) : 'Global'
  const secondaryLabel = activeRole.roleName

  const handleSwitch = async (context) => {
    if (context.roleId === activeRole.roleId || switching) return
    setSwitching(true)
    try {
      await selectRole(context)
      navigate('/portal', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Failed to switch role. Please try again.')
    } finally {
      setSwitching(false)
    }
  }

  // ── Collapsed: icon only with tooltip ──────────────────────────────────────
  if (collapsed) {
    return (
      <div className="px-2 py-2 border-b border-border flex justify-center">
        <Tooltip>
          <TooltipTrigger render={<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center cursor-default" />}>
            <Icon className="w-4 h-4 text-primary" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{primaryLabel}</p>
            <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  // ── Expanded ────────────────────────────────────────────────────────────────
  const contextBlock = (
    <div className={cn(
      'flex items-center gap-2.5 px-3 py-2.5 w-full',
      canSwitch && 'cursor-pointer hover:bg-sidebar-accent rounded-lg transition-colors',
    )}>
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        {switching
          ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
          : <Icon className="w-4 h-4 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
          {primaryLabel}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">
          {secondaryLabel}
        </p>
      </div>
      {canSwitch && (
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  )

  if (!canSwitch) {
    return (
      <div className="px-2 py-1.5 border-b border-border">
        {contextBlock}
      </div>
    )
  }

  return (
    <div className="px-2 py-1.5 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full rounded-lg outline-none" disabled={switching}>
          {contextBlock}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56" side="bottom">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Switch workspace
              </p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {contexts.map((context) => {
              const isActive       = context.roleId === activeRole.roleId
              const CtxIcon        = context.layer === 'campus' ? Building2 : Globe
              const ctxPrimary     = context.layer === 'campus'
                ? (context.campusName ?? `Campus #${context.campusId}`)
                : 'Global'
              return (
                <DropdownMenuItem
                  key={context.roleId}
                  onClick={() => handleSwitch(context)}
                  disabled={switching}
                >
                  <CtxIcon className="w-4 h-4 mr-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{ctxPrimary}</p>
                    <p className="text-xs text-muted-foreground truncate">{context.roleName}</p>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 ml-2 shrink-0 text-primary" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

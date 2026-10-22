import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Building2, Globe, ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { contextLabels } from '@/shells/portal/utils/roleLabels'
import WorkingCampusPicker from './WorkingCampusPicker'
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

// Two contexts are the same workspace only if the role AND the campus match
// (a teacher posted at two campuses has the same role id at both).
const sameContext = (a, b) => a.roleId === b.roleId && (a.campusId ?? null) === (b.campusId ?? null)
const contextKey = (c) => `${c.roleId}-${c.campusId ?? 'global'}`

// Shows where the signed-in account is working. The dropdown only appears when the
// account has more than one workspace (e.g. a teacher posted at two campuses).
// A Super Admin also gets the "Working campus" picker underneath.
export default function SidebarContext({ collapsed }) {
  const navigate = useNavigate()
  // baseRole = the real role (activeRole may carry the Super Admin's picked campus)
  const { baseRole: activeRole, contexts, selectRole, canPickCampus } = useRoleContext()
  const [switching, setSwitching] = useState(false)

  if (!activeRole) return null

  const canSwitch = contexts.length > 1
  const Icon = activeRole.layer === 'campus' ? Building2 : Globe
  const { primary: primaryLabel, secondary: secondaryLabel } = contextLabels(activeRole)

  const handleSwitch = async (context) => {
    if (sameContext(context, activeRole) || switching) return
    setSwitching(true)
    try {
      await selectRole(context)
      navigate('/portal', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Failed to switch workspace. Please try again.')
    } finally {
      setSwitching(false)
    }
  }

  // ── Collapsed: icon only with tooltip ──────────────────────────────────────
  if (collapsed) {
    return (
      <div className="px-2 py-2 border-b border-border flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger render={<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center cursor-default" />}>
            <Icon className="w-4 h-4 text-primary" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{primaryLabel}</p>
            <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
          </TooltipContent>
        </Tooltip>
        {canPickCampus && <WorkingCampusPicker collapsed />}
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
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{primaryLabel}</p>
        <p className="text-xs text-muted-foreground truncate leading-tight">{secondaryLabel}</p>
      </div>
      {canSwitch && <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
    </div>
  )

  const header = !canSwitch ? contextBlock : (
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
            const CtxIcon = context.layer === 'campus' ? Building2 : Globe
            const { primary, secondary } = contextLabels(context)
            return (
              <DropdownMenuItem
                key={contextKey(context)}
                onClick={() => handleSwitch(context)}
                disabled={switching}
              >
                <CtxIcon className="w-4 h-4 mr-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{primary}</p>
                  <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                </div>
                {sameContext(context, activeRole) && <Check className="w-3.5 h-3.5 ml-2 shrink-0 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="px-2 py-1.5 border-b border-border">
      {header}
      {canPickCampus && <WorkingCampusPicker />}
    </div>
  )
}
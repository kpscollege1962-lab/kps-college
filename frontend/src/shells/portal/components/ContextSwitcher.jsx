import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, Globe, ChevronDown, Check, Loader2 } from 'lucide-react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router'

export default function ContextSwitcher() {

  const navigate = useNavigate()

  const { activeRole, contexts, selectRole } = useRoleContext()
  const [switching, setSwitching] = useState(false)

  // Nothing to show if there's no context or only one context (nothing to switch to)
  if (!activeRole || contexts.length <= 1) return null

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

  const isCampusRole = (context) => context.layer === 'campus'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors outline-none disabled:opacity-50">
        {switching ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
        ) : isCampusRole(activeRole) ? (
          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="hidden sm:block font-medium text-foreground max-w-28 truncate">
          {activeRole.roleName}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
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
            const isActive = context.roleId === activeRole.roleId
            return (
              <DropdownMenuItem
                key={context.roleId}
                onClick={() => handleSwitch(context)}
                disabled={switching}
              >
                {isCampusRole(context)
                  ? <Building2 className="w-4 h-4 mr-2 shrink-0" />
                  : <Globe className="w-4 h-4 mr-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate">{context.roleName}</p>
                  {isCampusRole(context) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {context.campusName ?? `Campus #${context.campusId}`}
                    </p>
                  )}
                </div>
                {isActive && (
                  <Check className="w-3.5 h-3.5 ml-2 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

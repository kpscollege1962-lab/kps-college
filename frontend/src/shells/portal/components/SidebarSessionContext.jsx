import { useEffect } from 'react'
import { CalendarDays, ChevronDown, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { cn } from '@/lib/utils'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { loadSessionsThunk } from '@/shells/portal/state/sessionContext.thunks'
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

const STATUS_LABEL = {
  active:   'Active',
  upcoming: 'Upcoming',
  closing:  'Closing',
  closed:   'Closed',
}

export default function SidebarSessionContext({ collapsed }) {
  const dispatch = useDispatch()
  const { activeSession, sessions, loadStatus, selectSession } = useSessionContext()

  // Load sessions once on mount. The thunk's condition function makes this
  // idempotent — if sessions are already in state it exits immediately.
  useEffect(() => {
    dispatch(loadSessionsThunk())
  }, [dispatch])

  const isLoading = loadStatus.loading
  const isError   = loadStatus.success === false

  // No sessions and not in a transient state — none exist yet
  if (!isLoading && !isError && !activeSession) return null

  const handleRefresh = () => dispatch(loadSessionsThunk({ force: true }))

  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError) {
    if (collapsed) {
      return (
        <div className="px-2 py-2 border-b border-border flex justify-center">
          <Tooltip>
            <TooltipTrigger render={<button onClick={handleRefresh} className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors" />}>
              <RefreshCw className="w-4 h-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">Failed to load sessions</p>
              <p className="text-xs text-muted-foreground">Click to retry</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }

    return (
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              Sessions unavailable
            </p>
            <p className="text-xs text-muted-foreground truncate leading-tight">
              Failed to load
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger render={<button onClick={handleRefresh} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0" />}>
              <RefreshCw className="w-3.5 h-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Retry</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  // ── Loading state (no activeSession yet) ─────────────────────────────────────
  if (isLoading && !activeSession) {
    if (collapsed) {
      return (
        <div className="px-2 py-2 border-b border-border flex justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        </div>
      )
    }

    return (
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              Loading session…
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Normal state ─────────────────────────────────────────────────────────────
  const canSwitch   = sessions.length > 1
  const statusLabel = STATUS_LABEL[activeSession.status] ?? activeSession.status

  if (collapsed) {
    return (
      <div className="px-2 py-2 border-b border-border flex justify-center">
        <Tooltip>
          <TooltipTrigger render={<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center cursor-default" />}>
            {isLoading
              ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
              : <CalendarDays className="w-4 h-4 text-primary" />}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{activeSession.name}</p>
            <p className="text-xs text-muted-foreground">{statusLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  const sessionBlock = (
    <div className={cn(
      'flex items-center gap-2.5 px-3 py-2.5 w-full',
      canSwitch && 'cursor-pointer hover:bg-sidebar-accent rounded-lg transition-colors',
    )}>
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        {isLoading
          ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
          : <CalendarDays className="w-4 h-4 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
          {activeSession.name}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">
          {statusLabel}
        </p>
      </div>
      {canSwitch && (
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  )

  const refreshBtn = (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className="w-6 h-6 mr-1 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
    >
      {isLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <RefreshCw className="w-3.5 h-3.5" />}
    </button>
  )

  if (!canSwitch) {
    return (
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">{sessionBlock}</div>
          {refreshBtn}
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 py-1.5 border-b border-border">
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full rounded-lg outline-none">
              {sessionBlock}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" side="bottom">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Switch session
                  </p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {sessions.map((session) => {
                  const isActive = session.id === activeSession.id
                  return (
                    <DropdownMenuItem
                      key={session.id}
                      onClick={() => selectSession(session)}
                    >
                      <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{session.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {STATUS_LABEL[session.status] ?? session.status}
                        </p>
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
        </div>
        {refreshBtn}
      </div>
    </div>
  )
}

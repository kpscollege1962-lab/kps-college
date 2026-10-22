import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Building2, Globe, Loader2, AlertCircle } from 'lucide-react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { contextLabels } from '@/shells/portal/utils/roleLabels'
import ThemeToggle from '@/components/ThemeToggle'
import APP_CONFIG from '@/lib/config'

const contextKey = (c) => `${c.roleId}-${c.campusId ?? 'global'}`

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/portal'

  const { user } = useAuth()
  const { contexts, activeRole, selectRole } = useRoleContext()

  const [selectingKey, setSelectingKey] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeRole) navigate(redirectTo, { replace: true })
  }, [])

  useEffect(() => {
    if (contexts.length === 1 && !activeRole) {
      handleSelect(contexts[0])
    }
  }, [contexts]) 

  const handleSelect = async (context) => {
    setSelectingKey(contextKey(context))
    setError(null)
    try {
      await selectRole(context)
      navigate(redirectTo, { replace: true })
    } catch {
      setError('Failed to load workspace. Please try again.')
      setSelectingKey(null)
    }
  }

  const isLoading = selectingKey !== null
  const spinnerOnly = contexts.length === 1 && !error

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 border-b border-border">
        <span className="text-sm font-semibold text-foreground tracking-tight">
          {APP_CONFIG.APP_NAME}
        </span>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {spinnerOnly ? (
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Opening your workspace…
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Select your workspace</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back,{' '}
                <span className="font-medium text-foreground">{user?.first_name}</span>
                . Choose where you want to work.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              {contexts.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading workspaces…
                </div>
              ) : (
                contexts.map((context) => {
                  const key = contextKey(context)
                  const isSelecting = selectingKey === key
                  const { primary, secondary } = contextLabels(context)

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(context)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {context.layer === 'campus'
                          ? <Building2 className="w-5 h-5 text-primary" />
                          : <Globe className="w-5 h-5 text-primary" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{primary}</p>
                        <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                      </div>

                      {isSelecting && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useCampusSettings } from '../hooks/useCampusSettings'
import CampusSettingsForm from '../components/CampusSettingsForm'

export default function CampusSettingsPage() {
  const { activeRole } = useRoleContext()

  const { settings, loading, error, saving, saveError, fetchSettings, updateSettings } =
    useCampusSettings()

  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  useEffect(() => {
    fetchSettings(activeRole.campusId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSubmit = async (data) => {
    const result = await updateSettings(activeRole.campusId, data)

    if (result.success) {
      setFormError(null)
      setFormFieldErrors({})
      fetchSettings(activeRole.campusId)
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Campus Settings</h1>
          <p className="text-xs text-muted-foreground">
            Configure operational defaults for this campus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button size="icon-sm" variant="ghost" onClick={() => fetchSettings(activeRole.campusId)} disabled={loading}>
                <RefreshCw className={loading ? 'animate-spin' : ''} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Refresh</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Loading state */}
      {loading && !settings && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !settings && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form card */}
      {settings && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <CampusSettingsForm
            initialData={settings}
            onSubmit={handleFormSubmit}
            saving={saving}
            error={formError ?? saveError}
            fieldErrors={formFieldErrors}
          />
        </div>
      )}

    </div>
  )
}

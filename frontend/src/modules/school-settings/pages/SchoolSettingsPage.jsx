import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSchoolSettings } from '../hooks/useSchoolSettings'
import SchoolSettingsForm from '../components/SchoolSettingsForm'

export default function SchoolSettingsPage() {
  const { settings, loading, error, saving, saveError, fetchSettings, updateSettings } =
    useSchoolSettings()

  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  useEffect(() => {
    fetchSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSubmit = async (data) => {
    const result = await updateSettings(data)

    if (result.success) {
      setFormError(null)
      setFormFieldErrors({})
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
          <h1 className="text-xl font-bold text-foreground">School Settings</h1>
          <p className="text-xs text-muted-foreground">
            Configure your institution's profile and system defaults
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button size="icon-sm" variant="ghost" onClick={() => fetchSettings()} disabled={loading}>
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
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <SchoolSettingsForm
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

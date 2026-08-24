import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Copy, ListChecks } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { useClasses } from '../hooks/useClasses'
import ClassCard from '../components/ClassCard'
import ClassDialog from '../components/ClassDialog'
import SeedDefaultsDialog from '../components/SeedDefaultsDialog'
import CloneSessionDialog from '../components/CloneSessionDialog'

export default function ClassesPage() {
  const { activeRole }              = useRoleContext()
  const { activeSession, sessions } = useSessionContext()

  const campusId  = activeRole?.campusId
  const sessionId = activeSession?.id

  const {
    classes,
    total,
    loading,
    error,
    saving,
    deleting,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    seedDefaults,
    cloneFromSession,
    addSection,
    updateSection,
    deleteSection,
  } = useClasses(campusId, sessionId)

  const [classDialog,  setClassDialog]  = useState({ open: false, data: null })
  const [classError,   setClassError]   = useState(null)
  const [classFErrors, setClassFErrors] = useState({})
  const [seedOpen,     setSeedOpen]     = useState(false)
  const [cloneOpen,    setCloneOpen]    = useState(false)

  useEffect(() => {
    if (campusId && sessionId) fetchClasses()
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreateClass = () => {
    setClassError(null)
    setClassFErrors({})
    setClassDialog({ open: true, data: null })
  }

  const openEditClass = (cls) => {
    setClassError(null)
    setClassFErrors({})
    setClassDialog({ open: true, data: cls })
  }

  const handleClassDialogOpenChange = (open) => {
    if (!open) { setClassError(null); setClassFErrors({}) }
    setClassDialog(prev => ({ ...prev, open }))
  }

  const handleClassSubmit = async (data) => {
    const result = classDialog.data
      ? await updateClass(classDialog.data.id, data)
      : await createClass(data)
    if (result.success) {
      setClassDialog({ open: false, data: null })
    } else {
      setClassError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setClassFErrors(fe)
    }
  }

  const isEmpty = !loading && !error && classes.length === 0

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading…'
              : `${total} class${total !== 1 ? 'es' : ''} this session`}
          </p>
        </div>
        {!isEmpty && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchClasses()}
              disabled={loading}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Refresh
            </Button>
            <Can I="create" a="ClassGroup">
              <Button size="sm" onClick={openCreateClass} disabled={saving}>
                <Plus className="size-3.5 mr-1.5" />
                Add Class
              </Button>
            </Can>
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="size-6 rounded" />
              </div>
              <div className="px-4 py-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-6 py-20 border border-dashed border-border rounded-2xl">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">No classes set up for this session</p>
            <p className="text-xs text-muted-foreground">Load the standard curriculum, clone from another session, or add classes manually.</p>
          </div>
          <Can I="create" a="ClassGroup">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" onClick={() => setSeedOpen(true)} disabled={saving}>
                <ListChecks className="size-3.5 mr-1.5" />
                Load Standard Classes
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCloneOpen(true)} disabled={saving}>
                <Copy className="size-3.5 mr-1.5" />
                Clone from Session
              </Button>
              <Button size="sm" variant="outline" onClick={openCreateClass} disabled={saving}>
                <Plus className="size-3.5 mr-1.5" />
                Add Class Manually
              </Button>
            </div>
          </Can>
        </div>
      )}

      {/* Classes grid */}
      {!loading && !error && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classGroup={cls}
              saving={saving}
              deleting={deleting}
              onEditClass={openEditClass}
              onDeleteClass={deleteClass}
              onAddSection={addSection}
              onEditSection={updateSection}
              onDeleteSection={deleteSection}
            />
          ))}
        </div>
      )}

      {/* Class create/edit dialog */}
      <ClassDialog
        open={classDialog.open}
        onOpenChange={handleClassDialogOpenChange}
        initialData={classDialog.data}
        onSubmit={handleClassSubmit}
        saving={saving}
        error={classError}
        fieldErrors={classFErrors}
      />

      {/* Seed defaults dialog */}
      <SeedDefaultsDialog
        open={seedOpen}
        onOpenChange={setSeedOpen}
        onConfirm={seedDefaults}
        saving={saving}
      />

      {/* Clone session dialog */}
      <CloneSessionDialog
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        sessions={sessions}
        currentSessionId={sessionId}
        onConfirm={cloneFromSession}
        saving={saving}
      />

    </div>
  )
}

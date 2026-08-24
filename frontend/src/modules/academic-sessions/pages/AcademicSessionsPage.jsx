import { useEffect, useState } from 'react'
import { useAcademicSessions } from '../hooks/useAcademicSessions'
import AcademicSessionsHeader from '../components/AcademicSessionsHeader'
import AcademicSessionForm from '../components/AcademicSessionForm'
import AcademicSessionList from '../components/AcademicSessionList'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TRANSITION_COPY = {
  upcoming: {
    title:          'Activate Session',
    description:    (name) => `Activating "${name}" will make it the active session. Any currently active session will automatically be moved to Closing.`,
    confirmLabel:   'Activate',
    confirmVariant: 'default',
  },
  active: {
    title:          'Mark Session as Closing',
    description:    (name) => `This will mark "${name}" as closing, indicating it is winding down. You can complete it once finished.`,
    confirmLabel:   'Mark as Closing',
    confirmVariant: 'outline',
  },
  closing: {
    title:          'Complete Session',
    description:    (name) => `Completing "${name}" is permanent — completed sessions cannot be modified afterwards. Are you sure?`,
    confirmLabel:   'Complete',
    confirmVariant: 'destructive',
  },
}

export default function AcademicSessionsPage() {
  const {
    sessions, total, loading, error,
    saving, saveError,
    transitioning, transitionError,
    deleting, deleteError,
    fetchSessions, createSession, updateSession, transitionSession, deleteSession,
  } = useAcademicSessions()

  const [showForm, setShowForm]                 = useState(false)
  const [editingSession, setEditingSession]     = useState(null)
  const [formError, setFormError]               = useState(null)
  const [formFieldErrors, setFormFieldErrors]   = useState({})
  const [transitionTarget, setTransitionTarget] = useState(null)
  const [deleteTarget, setDeleteTarget]         = useState(null)

  useEffect(() => {
    fetchSessions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form handlers ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingSession(null)
    setFormError(null)
    setFormFieldErrors({})
    setShowForm(true)
  }

  const openEdit = (session) => {
    setEditingSession(session)
    setFormError(null)
    setFormFieldErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingSession(null)
    setFormError(null)
    setFormFieldErrors({})
  }

  const handleFormSubmit = async (data) => {
    const result = editingSession
      ? await updateSession(editingSession.id, data)
      : await createSession(data)

    if (result.success) {
      closeForm()
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  // ── Transition handlers ──────────────────────────────────────────────────────

  const handleTransitionRequest = (session) => setTransitionTarget(session)

  const handleTransitionConfirm = async () => {
    const result = await transitionSession(transitionTarget.id)
    if (result.success) setTransitionTarget(null)
  }

  // ── Delete handlers ──────────────────────────────────────────────────────────

  const handleDeleteRequest = (session) => setDeleteTarget(session)

  const handleDeleteConfirm = async () => {
    const result = await deleteSession(deleteTarget.id)
    if (result.success) setDeleteTarget(null)
  }

  const transitionCopy = transitionTarget ? TRANSITION_COPY[transitionTarget.status] : null

  return (
    <div className="space-y-6">

      <AcademicSessionsHeader
        total={total}
        loading={loading}
        onAddClick={openCreate}
        onRefresh={fetchSessions}
      />

      {/* Inline form */}
      {showForm && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{editingSession ? 'Edit Session' : 'New Session'}</CardTitle>
          </CardHeader>
          <CardContent>
            <AcademicSessionForm
              initialData={editingSession}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              saving={saving}
              error={formError ?? saveError}
              fieldErrors={formFieldErrors}
            />
          </CardContent>
        </Card>
      )}

      <AcademicSessionList
        sessions={sessions}
        loading={loading}
        error={error}
        saving={saving}
        transitioning={transitioning}
        deleting={deleting}
        onEdit={openEdit}
        onTransitionRequest={handleTransitionRequest}
        onDelete={handleDeleteRequest}
      />

      {/* Transition confirmation dialog */}
      <Dialog
        open={!!transitionTarget}
        onOpenChange={(open) => { if (!open) setTransitionTarget(null) }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{transitionCopy?.title}</DialogTitle>
            <DialogDescription>
              {transitionCopy?.description(transitionTarget?.name ?? '')}
            </DialogDescription>
          </DialogHeader>
          {transitionError && (
            <Alert variant="destructive">
              <AlertDescription>{transitionError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionTarget(null)} disabled={transitioning}>
              Cancel
            </Button>
            <Button
              variant={transitionCopy?.confirmVariant ?? 'default'}
              onClick={handleTransitionConfirm}
              disabled={transitioning}
            >
              {transitioning ? 'Saving…' : transitionCopy?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              {`"${deleteTarget?.name ?? ''}" will be permanently deleted. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

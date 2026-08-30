import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useFeeHeads } from '../hooks/useFeeHeads'
import FeeHeadDialog from '../components/FeeHeadDialog'
import DeleteConfirmDialog from '@/modules/classes/components/DeleteConfirmDialog'

const CATEGORY_LABEL = { fees: 'Fees', facilities: 'Facilities', fines: 'Fines' }
const CATEGORY_BADGE_CLASS = {
  fees:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  facilities: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0',
  fines:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0',
}

export default function FeeHeadsPage() {
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const {
    feeHeads,
    total,
    loading,
    error,
    saving,
    deleting,
    fetchFeeHeads,
    createFeeHead,
    updateFeeHead,
    deleteFeeHead,
  } = useFeeHeads(campusId)

  const [dialog, setDialog]           = useState({ open: false, data: null })
  const [formError, setFormError]     = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (campusId) fetchFeeHeads()
  }, [campusId]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setFormError(null)
    setFieldErrors({})
    setDialog({ open: true, data: null })
  }

  const openEdit = (feeHead) => {
    setFormError(null)
    setFieldErrors({})
    setDialog({ open: true, data: feeHead })
  }

  const handleDialogOpenChange = (open) => {
    if (!open) { setFormError(null); setFieldErrors({}) }
    setDialog((prev) => ({ ...prev, open }))
  }

  const handleSubmit = async (data) => {
    const result = dialog.data
      ? await updateFeeHead(dialog.data.id, data)
      : await createFeeHead(data)
    if (result.success) {
      setDialog({ open: false, data: null })
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFieldErrors(fe)
    }
  }

  const isEmpty = !loading && !error && feeHeads.length === 0

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Heads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : `${total} fee head${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => fetchFeeHeads()} disabled={loading}>
            <RefreshCw className="size-3.5 mr-1.5" />
            Refresh
          </Button>
          <Can I="create" a="FeeHead">
            <Button size="sm" onClick={openCreate} disabled={saving}>
              <Plus className="size-3.5 mr-1.5" />
              Add Fee Head
            </Button>
          </Can>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
        <div className="flex flex-col items-center justify-center gap-4 py-20 border border-dashed border-border rounded-2xl">
          <p className="text-sm font-medium text-foreground">No fee heads yet</p>
          <p className="text-xs text-muted-foreground">Add fee types like Tuition, Transport, or Lab Fee to get started.</p>
          <Can I="create" a="FeeHead">
            <Button size="sm" onClick={openCreate} disabled={saving}>
              <Plus className="size-3.5 mr-1.5" />
              Add Fee Head
            </Button>
          </Can>
        </div>
      )}

      {/* Fee heads list */}
      {!loading && !error && feeHeads.length > 0 && (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {feeHeads.map((fh) => (
            <div key={fh.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="font-medium text-sm text-foreground truncate">{fh.name}</span>
                <Badge className={`text-xs shrink-0 ${CATEGORY_BADGE_CLASS[fh.category] ?? ''}`}>
                  {CATEGORY_LABEL[fh.category] ?? fh.category}
                </Badge>
                {!fh.is_active && (
                  <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Can I="update" a="FeeHead">
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(fh)} disabled={saving || deleting}>
                    <Pencil className="size-3.5" />
                  </Button>
                </Can>
                <Can I="delete" a="FeeHead">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(fh)}
                    disabled={saving || deleting}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/edit dialog */}
      <FeeHeadDialog
        open={dialog.open}
        onOpenChange={handleDialogOpenChange}
        initialData={dialog.data}
        onSubmit={handleSubmit}
        saving={saving}
        error={formError}
        fieldErrors={fieldErrors}
      />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Fee Head"
        description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
        onConfirm={async () => {
          const result = await deleteFeeHead(deleteTarget.id)
          if (result.success) setDeleteTarget(null)
          return result
        }}
        deleting={deleting}
      />

    </div>
  )
}
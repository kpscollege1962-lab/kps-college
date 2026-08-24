import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import {
  listRegisterEntriesService,
  upsertRegisterEntryService,
  deleteRegisterEntryService,
} from '../services/registerEntries.service'
import RegisterEntryRow from '../components/RegisterEntryRow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { REGISTER_LEVELS as LEVELS, REGISTER_LEVEL_LABELS as LEVEL_LABELS } from '../constants/registerLevels'

const initRows = () =>
  Object.fromEntries(
    LEVELS.map((level) => [level, { admission_no: '', entry_date: '', notes: '', class_of_admission: '', exists: false }])
  )

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentRegistersPage() {
  const { studentId } = useParams()
  const parsedStudentId = parseInt(studentId)

  const [rows,          setRows]          = useState(initRows)
  const [loading,       setLoading]       = useState(false)
  const [fetchError,    setFetchError]    = useState(null)
  const [rowSaving,     setRowSaving]     = useState({})
  const [rowErrors,     setRowErrors]     = useState({})
  const [rowSuccess,    setRowSuccess]    = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const result = await listRegisterEntriesService(parsedStudentId)
    setLoading(false)
    if (result.success) {
      const populated = initRows()
      ;(result.data?.entries ?? []).forEach((entry) => {
        populated[entry.register_level] = {
          admission_no:       entry.admission_no,
          entry_date:         entry.entry_date         ?? '',
          notes:              entry.notes              ?? '',
          class_of_admission: entry.class_of_admission ?? '',
          exists:             true,
        }
      })
      setRows(populated)
    } else {
      setFetchError(result.message)
    }
  }, [parsedStudentId])

  useEffect(() => {
    fetchEntries()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRowChange = (level, field, value) => {
    setRows((prev) => ({ ...prev, [level]: { ...prev[level], [field]: value } }))
  }

  const handleSave = async (level) => {
    const row = rows[level]
    if (!row.admission_no.trim()) {
      setRowErrors((prev) => ({ ...prev, [level]: 'Admission number is required' }))
      return
    }
    setRowSaving((prev)  => ({ ...prev, [level]: true  }))
    setRowErrors((prev)  => ({ ...prev, [level]: null  }))
    setRowSuccess((prev) => ({ ...prev, [level]: false }))

    const result = await upsertRegisterEntryService(parsedStudentId, level, {
      admission_no:          row.admission_no.trim(),
      ...(row.entry_date                    ? { entry_date: row.entry_date }                             : {}),
      ...(row.notes.trim()                  ? { notes: row.notes.trim() }                                : {}),
      ...(row.class_of_admission?.trim()    ? { class_of_admission: row.class_of_admission.trim() }      : {}),
    })

    setRowSaving((prev) => ({ ...prev, [level]: false }))
    if (result.success) {
      setRows((prev) => ({ ...prev, [level]: { ...prev[level], exists: true } }))
      setRowSuccess((prev) => ({ ...prev, [level]: true }))
      setTimeout(() => setRowSuccess((prev) => ({ ...prev, [level]: false })), 2000)
    } else {
      setRowErrors((prev) => ({ ...prev, [level]: result.message }))
    }
  }

  const handleDelete = async (level) => {
    setRowSaving((prev) => ({ ...prev, [level]: true  }))
    setRowErrors((prev) => ({ ...prev, [level]: null  }))

    const result = await deleteRegisterEntryService(parsedStudentId, level)

    setRowSaving((prev) => ({ ...prev, [level]: false }))
    if (result.success) {
      setRows((prev) => ({
        ...prev,
        [level]: { admission_no: '', entry_date: '', notes: '', class_of_admission: '', exists: false },
      }))
    } else {
      setRowErrors((prev) => ({ ...prev, [level]: result.message }))
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3">
        {LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 shrink-0" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-40 shrink-0" />
            <Skeleton className="h-9 w-36 shrink-0" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-16 shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">

      {/* Column headers */}
      <div className="hidden sm:grid sm:grid-cols-[9rem_1fr_11rem_10rem_1fr_5rem] gap-3 px-1 mb-1">
        <span className="text-xs font-medium text-muted-foreground">Level</span>
        <span className="text-xs font-medium text-muted-foreground">Admission No</span>
        <span className="text-xs font-medium text-muted-foreground">Class of Admission</span>
        <span className="text-xs font-medium text-muted-foreground">Entry Date</span>
        <span className="text-xs font-medium text-muted-foreground">Notes</span>
        <span />
      </div>

      {LEVELS.map((level) => (
        <RegisterEntryRow
          key={level}
          level={level}
          levelLabel={LEVEL_LABELS[level]}
          row={rows[level]}
          saving={rowSaving[level]  ?? false}
          success={rowSuccess[level] ?? false}
          error={rowErrors[level]   ?? null}
          onChange={(field, value) => handleRowChange(level, field, value)}
          onSave={() => handleSave(level)}
          onDeleteRequest={() => setPendingDelete(level)}
        />
      ))}

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove register entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the {pendingDelete ? LEVEL_LABELS[pendingDelete] : ''} entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const level = pendingDelete
                setPendingDelete(null)
                handleDelete(level)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

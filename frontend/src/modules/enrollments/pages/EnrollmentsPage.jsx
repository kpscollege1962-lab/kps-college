import { useEffect, useRef, useState } from 'react'
import { useEnrollments } from '../hooks/useEnrollments'
import EnrollmentsHeader from '../components/EnrollmentsHeader'
import EnrollmentCreateForm from '../components/EnrollmentCreateForm'
import { DataTable } from '@/components/ui/data-table'
import { getEnrollmentColumns } from '../components/enrollments.columns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Pagination } from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

export default function EnrollmentsPage() {
  const {
    // reference data
    campuses, classes, sections, classesLoading,
    // filters
    campusFilter, classFilter, sectionFilter, statusFilter, search,
    handleCampusFilterChange, handleClassFilterChange,
    handleSectionFilterChange, handleStatusFilterChange,
    handleSearchChange, triggerSearchFetch,
    handlePageChange, handleLimitChange,
    // list
    enrollments, total, page, limit, loading, error,
    fetchEnrollments,
    // crud
    canEnroll, saving, deleting,
    createEnrollment, deleteEnrollment,
  } = useEnrollments()

  // ── Dialog state (page-local only) ───────────────────────────────────────
  const [isCreateOpen,  setIsCreateOpen]  = useState(false)
  const [createError,   setCreateError]   = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteError,   setDeleteError]   = useState(null)

  // ── Search debounce ───────────────────────────────────────────────────────
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const timer = setTimeout(() => triggerSearchFetch(search), 1000)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create handlers ───────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setCreateError(null)
    setIsCreateOpen(true)
  }

  const handleCreateDialogChange = (open) => {
    if (!open) setCreateError(null)
    setIsCreateOpen(open)
  }

  const handleCreateSubmit = async (studentId) => {
    const result = await createEnrollment(studentId)
    if (result.success) {
      setIsCreateOpen(false)
      setCreateError(null)
    } else {
      setCreateError(result.message)
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteClick = (enrollment) => {
    setDeleteError(null)
    setDeleteTarget(enrollment)
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteEnrollment(deleteTarget.id)
    if (result.success) {
      setDeleteTarget(null)
      setDeleteError(null)
    } else {
      setDeleteError(result.message)
    }
  }

  // ── Context display for the form ──────────────────────────────────────────
  // Derive human-readable labels from filter IDs for the form's context summary
  const selectedCampus  = campuses.find(c => String(c.id) === campusFilter)  ?? null
  const selectedClass   = classes.find(c  => String(c.id) === classFilter)   ?? null
  const selectedSection = sections.find(s => String(s.id) === sectionFilter) ?? null

  const columns = getEnrollmentColumns({ page, limit, onDeleteClick: handleDeleteClick, deleting })

  return (
    <div className="space-y-6">

      <EnrollmentsHeader
        total={total}
        loading={loading}
        onAddClick={handleOpenCreate}
        onRefresh={() => fetchEnrollments({})}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        campuses={campuses}
        campusFilter={campusFilter}
        onCampusFilterChange={handleCampusFilterChange}
        classes={classes}
        classesLoading={classesLoading}
        classFilter={classFilter}
        onClassFilterChange={handleClassFilterChange}
        sections={sections}
        sectionFilter={sectionFilter}
        onSectionFilterChange={handleSectionFilterChange}
        canEnroll={canEnroll}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          data={enrollments}
          loading={loading}
          searchable={false}
          pageSize={limit}
          emptyMessage="No enrollments found."
        />
      )}

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
      />

      {/* Enrollment create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
          </DialogHeader>
          <EnrollmentCreateForm
            campus={selectedCampus}
            classGroup={selectedClass}
            section={selectedSection}
            isUnsectioned={sections.length === 0}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            saving={saving}
            error={createError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>This will permanently delete the enrollment for {deleteTarget.student?.full_name}. This cannot be undone.</>
              )}
            </AlertDialogDescription>
            {deleteError && <p className="text-sm text-destructive mt-1">{deleteError}</p>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

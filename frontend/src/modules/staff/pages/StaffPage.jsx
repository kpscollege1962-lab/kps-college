import { useEffect, useState, useRef } from 'react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useStaff } from '../hooks/useStaff'
import StaffHeader from '../components/StaffHeader'
import StaffDialog from '../components/StaffDialog'
import AddExistingStaffForm from '../components/AddExistingStaffForm'
import { DataTable } from '@/components/ui/data-table'
import { getStaffColumns } from '../components/staff.columns'
import { Pagination } from '@/components/ui/pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function StaffPage() {
  const { activeRole } = useRoleContext()

  const {
    staff,
    total,
    page,
    limit,
    loading,
    error,
    saving,
    fetchStaff,
    createStaff,
    addExistingStaff,
  } = useStaff(activeRole.campusId)

  const [staffDialog, setStaffDialog]         = useState({ open: false, data: null })
  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const [existingDialog, setExistingDialog]                   = useState(false)
  const [existingFormError, setExistingFormError]             = useState(null)
  const [existingFormFieldErrors, setExistingFormFieldErrors] = useState({})

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const searchRef                       = useRef('')
  const statusFilterRef                 = useRef('active')
  const isFirstRender                   = useRef(true)

  const isActiveParam = (status) => {
    if (status === 'active')   return '1'
    if (status === 'inactive') return '0'
    return undefined
  }

  useEffect(() => {
    fetchStaff({ isActive: isActiveParam(statusFilterRef.current) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    searchRef.current = search
    const timer = setTimeout(() => {
      if (searchRef.current === search) {
        fetchStaff({
          search:   search || undefined,
          isActive: isActiveParam(statusFilterRef.current),
          page:     1,
        })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (val) => {
    setStatusFilter(val)
    statusFilterRef.current = val
    fetchStaff({
      search:   search || undefined,
      isActive: isActiveParam(val),
      page:     1,
    })
  }

  const handlePageChange = (newPage) => {
    fetchStaff({
      page:     newPage,
      search:   search || undefined,
      isActive: isActiveParam(statusFilter),
    })
  }

  const handleLimitChange = (newLimit) => {
    fetchStaff({
      limit:    newLimit,
      page:     1,
      search:   search || undefined,
      isActive: isActiveParam(statusFilter),
    })
  }

  // ── Create new staff ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setFormError(null)
    setFormFieldErrors({})
    setStaffDialog({ open: true, data: null })
  }

  const handleDialogOpenChange = (open) => {
    if (!open) {
      setFormError(null)
      setFormFieldErrors({})
    }
    setStaffDialog((prev) => ({ ...prev, open }))
  }

  const handleFormSubmit = async (data) => {
    const result = await createStaff(data)

    if (result.success) {
      setStaffDialog({ open: false, data: null })
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  // ── Add existing staff ────────────────────────────────────────────────────────

  const openAddExisting = () => {
    setExistingFormError(null)
    setExistingFormFieldErrors({})
    setExistingDialog(true)
  }

  const handleExistingDialogChange = (open) => {
    if (!open) {
      setExistingFormError(null)
      setExistingFormFieldErrors({})
    }
    setExistingDialog(open)
  }

  const handleExistingFormSubmit = async (staffId, data) => {
    const result = await addExistingStaff(staffId, data)
    if (result.success) {
      setExistingDialog(false)
    } else {
      setExistingFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setExistingFormFieldErrors(fe)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const columns = getStaffColumns({ page, limit })

  return (
    <div className="space-y-6">

      <StaffHeader
        total={total}
        loading={loading}
        onAddClick={openCreate}
        onAddExistingClick={openAddExisting}
        onRefresh={() => fetchStaff({ search: search || undefined, isActive: isActiveParam(statusFilter), page: 1 })}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />

      <StaffDialog
        open={staffDialog.open}
        onOpenChange={handleDialogOpenChange}
        initialData={staffDialog.data}
        onSubmit={handleFormSubmit}
        saving={saving}
        error={formError}
        fieldErrors={formFieldErrors}
      />

      <Dialog open={existingDialog} onOpenChange={handleExistingDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Existing Staff Member</DialogTitle>
            <DialogDescription>
              Search for a staff member already registered in the system and add
              them to this campus.
            </DialogDescription>
          </DialogHeader>
          <AddExistingStaffForm
            campusId={activeRole.campusId}
            onSubmit={handleExistingFormSubmit}
            onCancel={() => setExistingDialog(false)}
            saving={saving}
            error={existingFormError}
            fieldErrors={existingFormFieldErrors}
          />
        </DialogContent>
      </Dialog>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          data={staff}
          loading={loading}
          searchable={false}
          pageSize={limit}
          emptyMessage="No staff members found."
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

    </div>
  )
}

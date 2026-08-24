import { useEffect, useState, useRef } from 'react'
import { useStudents } from '../hooks/useStudents'
import StudentsHeader from '../components/StudentsHeader'
import StudentDialog from '../components/StudentDialog'
import { DataTable } from '@/components/ui/data-table'
import { getStudentColumns } from '../components/students.columns'
import { Pagination } from '@/components/ui/pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function StudentsPage() {
  const {
    students,
    total,
    page,
    limit,
    loading,
    error,
    saving,
    fetchStudents,
    createStudent,
  } = useStudents()

  const [studentDialog, setStudentDialog]     = useState({ open: false, data: null })
  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const [search, setSearch]   = useState('')
  const [registerLevel, setRegisterLevel] = useState('')
  const searchRef             = useRef('')
  const isFirstRender         = useRef(true)

  useEffect(() => {
    fetchStudents({})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    searchRef.current = search
    const timer = setTimeout(() => {
      if (searchRef.current === search) {
        fetchStudents({ search: search || undefined, page: 1 })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange  = (newPage)  => fetchStudents({ page: newPage })
  const handleLimitChange = (newLimit) => fetchStudents({ limit: newLimit, page: 1 })

  const handleRegisterLevelChange = (value) => {
    setRegisterLevel(value)
    fetchStudents({ registerLevel: value || undefined, page: 1 })
  }

  const openCreate = () => {
    setFormError(null)
    setFormFieldErrors({})
    setStudentDialog({ open: true, data: null })
  }

  const handleDialogOpenChange = (open) => {
    if (!open) {
      setFormError(null)
      setFormFieldErrors({})
    }
    setStudentDialog((prev) => ({ ...prev, open }))
  }

  const handleFormSubmit = async (data) => {
    const result = await createStudent(data)
    if (result.success) {
      setStudentDialog({ open: false, data: null })
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  const columns = getStudentColumns({ page, limit })

  return (
    <div className="space-y-6">

      <StudentsHeader
        total={total}
        loading={loading}
        onAddClick={openCreate}
        onRefresh={() => fetchStudents({ search: search || undefined, registerLevel: registerLevel || undefined, page: 1 })}
        search={search}
        onSearchChange={setSearch}
        registerLevelFilter={registerLevel}
        onRegisterLevelFilterChange={handleRegisterLevelChange}
      />

      <StudentDialog
        open={studentDialog.open}
        onOpenChange={handleDialogOpenChange}
        initialData={studentDialog.data}
        onSubmit={handleFormSubmit}
        saving={saving}
        error={formError}
        fieldErrors={formFieldErrors}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchable={false}
          pageSize={limit}
          emptyMessage="No students found."
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

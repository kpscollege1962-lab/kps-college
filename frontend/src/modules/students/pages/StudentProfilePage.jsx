import { useState } from 'react'
import { useParams, useOutletContext } from 'react-router'
import { Pencil } from 'lucide-react'
import { updateStudentService } from '../services/students.service'
import StudentDialog from '../components/StudentDialog'
import StudentAdmissionCard from '../components/StudentAdmissionCard'
import StudentContactsCard from '../components/StudentContactsCard'
import StudentPersonalCard from '../components/StudentPersonalCard'
import { Button } from '@/components/ui/button'
import { Can } from '@/casl/AbilityProvider'

export default function StudentProfilePage() {
  const { studentId } = useParams()
  const { student, fetchStudent } = useOutletContext()

  const parsedStudentId = parseInt(studentId)

  const [editOpen,        setEditOpen]        = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [formError,       setFormError]       = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const handleEditSubmit = async (data) => {
    setSaving(true)
    setFormError(null)
    const result = await updateStudentService(parsedStudentId, data)
    setSaving(false)
    if (result.success) {
      setEditOpen(false)
      fetchStudent()
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  const handleDialogOpenChange = (open) => {
    if (!open) {
      setFormError(null)
      setFormFieldErrors({})
    }
    setEditOpen(open)
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-end">
        <Can I="update" a="Student">
          <Button size="icon" variant="outline" onClick={() => setEditOpen(true)} disabled={saving} aria-label="Edit student">
            <Pencil className="h-4 w-4" />
          </Button>
        </Can>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StudentAdmissionCard student={student} />
        <StudentContactsCard  student={student} />
        <StudentPersonalCard  student={student} />
      </div>

      <StudentDialog
        open={editOpen}
        onOpenChange={handleDialogOpenChange}
        initialData={student}
        onSubmit={handleEditSubmit}
        saving={saving}
        error={formError}
        fieldErrors={formFieldErrors}
      />

    </div>
  )
}

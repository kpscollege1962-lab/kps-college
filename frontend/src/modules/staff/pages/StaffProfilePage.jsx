import { useState } from 'react'
import { useParams, useOutletContext } from 'react-router'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { Pencil } from 'lucide-react'
import { updateStaffService } from '../services/staff.service'
import StaffDialog from '../components/StaffDialog'
import StaffPersonalCard from '../components/StaffPersonalCard'
import StaffContactsCard from '../components/StaffContactsCard'
import StaffQualificationsCard from '../components/StaffQualificationsCard'
import { Button } from '@/components/ui/button'
import { Can } from '@/casl/AbilityProvider'

export default function StaffProfilePage() {
  const { staffId } = useParams()
  const { activeRole } = useRoleContext()
  const { staff, fetchStaff } = useOutletContext()

  const parsedStaffId  = parseInt(staffId)

  const [editOpen,        setEditOpen]        = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [formError,       setFormError]       = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const handleEditSubmit = async (data) => {
    setSaving(true)
    setFormError(null)
    const result = await updateStaffService(activeRole.campusId, parsedStaffId, data)
    setSaving(false)
    if (result.success) {
      setEditOpen(false)
      fetchStaff()
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
        <Can I="update" a="Staff">
          <Button size="icon" variant="outline" onClick={() => setEditOpen(true)} disabled={saving} aria-label="Edit staff member">
            <Pencil className="h-4 w-4" />
          </Button>
        </Can>
      </div>

      <StaffContactsCard staff={staff} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StaffPersonalCard       staff={staff} />
        <StaffQualificationsCard staff={staff} />
      </div>

      <StaffDialog
        open={editOpen}
        onOpenChange={handleDialogOpenChange}
        initialData={staff}
        onSubmit={handleEditSubmit}
        saving={saving}
        error={formError}
        fieldErrors={formFieldErrors}
      />

    </div>
  )
}

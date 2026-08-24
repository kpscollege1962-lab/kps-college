import { useEffect, useState } from 'react'
import { useCampuses } from '../hooks/useCampuses'
import CampusesHeader from '../components/CampusesHeader'
import CampusForm from '../components/CampusForm'
import CampusList from '../components/CampusList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function CampusesPage() {
  const { campuses, total, loading, error, saving, saveError, fetchCampuses, createCampus, updateCampus } =
    useCampuses()

  const [showForm, setShowForm]               = useState(false)
  const [editingCampus, setEditingCampus]     = useState(null)
  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  useEffect(() => {
    fetchCampuses()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingCampus(null)
    setFormError(null)
    setFormFieldErrors({})
    setShowForm(true)
  }

  const openEdit = (campus) => {
    setEditingCampus(campus)
    setFormError(null)
    setFormFieldErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCampus(null)
    setFormError(null)
    setFormFieldErrors({})
  }

  const handleFormSubmit = async (data) => {
    const result = editingCampus
      ? await updateCampus(editingCampus.id, data)
      : await createCampus(data)

    if (result.success) {
      closeForm()
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  return (
    <div className="space-y-6">

      <CampusesHeader total={total} loading={loading} onAddClick={openCreate} onRefresh={fetchCampuses} />

      {/* Inline form */}
      {showForm && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{editingCampus ? 'Edit Campus' : 'New Campus'}</CardTitle>
          </CardHeader>
          <CardContent>
            <CampusForm
              initialData={editingCampus}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              saving={saving}
              error={formError ?? saveError}
              fieldErrors={formFieldErrors}
            />
          </CardContent>
        </Card>
      )}

      <CampusList
        campuses={campuses}
        loading={loading}
        error={error}
        saving={saving}
        onEdit={openEdit}
      />

    </div>
  )
}

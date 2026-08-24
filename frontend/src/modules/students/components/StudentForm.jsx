import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useEnrollmentSetup } from '../hooks/useEnrollmentSetup'
import { formatCnic } from '@/lib/formatUtils'
import AdmissionTab from './tabs/AdmissionTab'
import PersonalTab from './tabs/PersonalTab'
import ContactsTab from './tabs/ContactsTab'
import EnrollmentTab from './tabs/EnrollmentTab'
import { Separator } from '@/components/ui/separator'

export default function StudentForm({ initialData = null, onSubmit, onCancel, saving = false, error = null, fieldErrors = {} }) {
  const [formError, setFormError] = useState(null)

  const [form, setForm] = useState({
    // Admission tab
    gr_no: initialData?.gr_no ?? '',
    admission_date: initialData?.admission_date ?? '',

    // Personal tab
    full_name: initialData?.full_name?.toUpperCase() ?? '',
    gender: initialData?.gender ?? '',
    date_of_birth: initialData?.date_of_birth ?? '',
    b_form_no: initialData?.b_form_no ? formatCnic(initialData.b_form_no) : '',
    blood_group: initialData?.blood_group ?? '',
    religion: initialData?.religion?.toUpperCase() ?? '',
    nationality: initialData?.nationality?.toUpperCase() ?? '',
    domicile_district: initialData?.domicile_district?.toUpperCase() ?? '',
    father_name: initialData?.father_name?.toUpperCase() ?? '',
    father_cnic: initialData?.father_cnic ? formatCnic(initialData.father_cnic) : '',
    father_occupation: initialData?.father_occupation?.toUpperCase() ?? '',
    address: initialData?.address?.toUpperCase() ?? '',

    // Enrollment tab (create mode only)
    admission_no: '',

    // Contacts tab
    contacts: initialData?.contacts?.length
      ? initialData.contacts.map(c => ({
        name: c.name ?? '',
        label: c.label,
        phone: c.phone,
        is_primary: c.is_primary,
      }))
      : [{ name: '', label: 'Father', phone: '', is_primary: 1 }],
  })

  const enrollment = useEnrollmentSetup({ isCreateMode: !initialData })

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const UPPERCASE_FIELDS = new Set([
    'full_name', 'father_name', 'father_occupation',
    'religion', 'nationality', 'domicile_district', 'address', 'blood_group',
  ])

  const CNIC_FIELDS = new Set(['father_cnic', 'b_form_no'])

  const handleChange = (e) => {
    const { name, value } = e.target
    let transformed = value
    if (UPPERCASE_FIELDS.has(name)) transformed = value.toUpperCase()
    else if (CNIC_FIELDS.has(name)) transformed = formatCnic(value, form[name])
    setForm((prev) => {
      const update = { ...prev, [name]: transformed }
      if (name === 'father_name') {
        const first = prev.contacts[0]
        if (first && (first.name === '' || first.name === prev.father_name)) {
          update.contacts = prev.contacts.map((c, i) => i === 0 ? { ...c, name: transformed } : c)
        }
      }
      return update
    })
  }

  const handleContactChange = (index, field, value) => {
    setForm((prev) => {
      const transformed = field === 'name' ? value.toUpperCase() : value
      const contacts = prev.contacts.map((c, i) => i === index ? { ...c, [field]: transformed } : c)
      return { ...prev, contacts }
    })
  }

  const handlePrimaryChange = (index) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => ({ ...c, is_primary: i === index ? 1 : 0 })),
    }))
  }

  const addContact = () => {
    setForm((prev) => {
      const last = prev.contacts[prev.contacts.length - 1]
      return {
        ...prev,
        contacts: [...prev.contacts, { label: last?.label ?? '', name: last?.name ?? '', phone: '', is_primary: 0 }],
      }
    })
  }

  const removeContact = (index) => {
    setForm((prev) => {
      const contacts = prev.contacts.filter((_, i) => i !== index)
      const hasPrimary = contacts.some(c => c.is_primary === 1)
      if (!hasPrimary && contacts.length > 0) contacts[0].is_primary = 1
      return { ...prev, contacts }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!initialData) {
      const selectedClassObj = enrollment.classes.find(c => c.id === enrollment.enrollClassId)
      const classHasSections = (selectedClassObj?.sections?.length ?? 0) > 0
      const sectionRequired  = classHasSections && !enrollment.enrollSectionId

      if (!enrollment.enrollCampusId || !enrollment.enrollClassId || sectionRequired) {
        setFormError('Please complete the Enrollment tab — campus and class are required, and a section must be selected if the class has sections.')
        return
      }
    }
    setFormError(null)

    const payload = {
      gr_no: form.gr_no.trim(),
      full_name: form.full_name.trim(),
      father_name: form.father_name.trim(),
      gender: form.gender,
      contacts: form.contacts.map(c => ({
        name: c.name?.trim() || null,
        label: c.label.trim(),
        phone: c.phone.trim(),
        is_primary: c.is_primary,
      })),
    }

    if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
    if (form.b_form_no.trim()) payload.b_form_no = form.b_form_no.trim()
    if (form.religion.trim()) payload.religion = form.religion.trim()
    if (form.nationality.trim()) payload.nationality = form.nationality.trim()
    if (form.blood_group.trim()) payload.blood_group = form.blood_group.trim()
    if (form.address.trim()) payload.address = form.address.trim()
    if (form.admission_date) payload.admission_date = form.admission_date
    if (form.father_cnic.trim()) payload.father_cnic = form.father_cnic.trim()
    if (form.father_occupation.trim()) payload.father_occupation = form.father_occupation.trim()
    if (form.domicile_district.trim()) payload.domicile_district = form.domicile_district.trim()

    if (!initialData) {
      payload.campusId     = enrollment.enrollCampusId
      payload.sessionId    = enrollment.activeSession?.id
      payload.classGroupId = enrollment.enrollClassId
      if (enrollment.enrollSectionId) payload.sectionId = parseInt(enrollment.enrollSectionId)
      if (form.admission_no.trim()) payload.admission_no = form.admission_no.trim()
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <Tabs defaultValue="admission">

        <Separator />

        <TabsList className="w-auto mb-5">
          <TabsTrigger value="admission">Admission</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          {!initialData && <TabsTrigger value="enrollment">Enrollment</TabsTrigger>}
        </TabsList>

        <TabsContent value="admission">
          <AdmissionTab
            form={form}
            handleChange={handleChange}
            setForm={setForm}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="personal">
          <PersonalTab
            form={form}
            handleChange={handleChange}
            setForm={setForm}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab
            contacts={form.contacts}
            handleContactChange={handleContactChange}
            handlePrimaryChange={handlePrimaryChange}
            addContact={addContact}
            removeContact={removeContact}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

        {!initialData && (
          <TabsContent value="enrollment">
            <EnrollmentTab
              enrollment={enrollment}
              admissionNo={form.admission_no}
              onChange={handleChange}
              fieldErrors={fieldErrors}
              saving={saving}
            />
          </TabsContent>
        )}
      </Tabs>

      {(error || formError) && (
        <Alert variant="destructive">
          <AlertDescription>{error ?? formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving || (!initialData && (enrollment.campusesLoading || enrollment.classesLoading))}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add Student'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}

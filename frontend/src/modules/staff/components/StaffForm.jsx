import { useState } from 'react'
import { formatCnic } from '@/lib/formatUtils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import PersonalTab from './tabs/PersonalTab'
import EmploymentTab from './tabs/EmploymentTab'
import ContactsTab from './tabs/ContactsTab'
import QualificationsTab from './tabs/QualificationsTab'

export default function StaffForm({ initialData = null, onSubmit, onCancel, saving = false, error = null, fieldErrors = {} }) {
  const [form, setForm] = useState({
    // Personal
    full_name:      initialData?.full_name      ?? '',
    name_initials:  initialData?.name_initials  ?? '',
    gender:         initialData?.gender         ?? '',
    date_of_birth:  initialData?.date_of_birth  ?? '',
    cnic:           initialData?.cnic ? formatCnic(initialData.cnic) : '',
    marital_status: initialData?.marital_status ?? '',
    address:        initialData?.address        ?? '',

    // Employment
    employee_no:              initialData?.postings?.[0]?.employee_no              ?? '',
    joining_date:              initialData?.postings?.[0]?.joining_date            ?? '',
    is_timetable_eligible:    initialData?.postings?.[0]?.is_timetable_eligible    ?? 0,
    allow_concurrent_periods: initialData?.postings?.[0]?.allow_concurrent_periods ?? 0,
    email:                    initialData?.email ?? '',

    // Phones
    phones: initialData?.phones?.length
      ? initialData.phones.map(p => ({ label: p.label ?? '', phone: p.phone, is_primary: p.is_primary }))
      : [{ label: '', phone: '', is_primary: 1 }],

    // Qualifications — split by type for independent management
    academic_qualifications: initialData?.qualifications
      ?.filter(q => q.type === 'academic')
      .map(q => ({ title: q.title, completion_date: q.completion_date ?? '' }))
      ?? [],

    professional_qualifications: initialData?.qualifications
      ?.filter(q => q.type === 'professional')
      .map(q => ({ title: q.title, completion_date: q.completion_date ?? '' }))
      ?? [],
  })

  // ── Field handler (uppercase transform) ──────────────────────────────────────

  const UPPERCASE_FIELDS = new Set(['full_name', 'address'])
  const CNIC_FIELDS      = new Set(['cnic'])

  const handleChange = (e) => {
    const { name, value } = e.target
    let transformed = value
    if (UPPERCASE_FIELDS.has(name))      transformed = value.toUpperCase()
    else if (CNIC_FIELDS.has(name))      transformed = formatCnic(value, form[name])
    setForm(prev => ({ ...prev, [name]: transformed }))
  }

  // ── Phone handlers ────────────────────────────────────────────────────────────

  const handlePhoneChange = (index, field, value) =>
    setForm(prev => ({ ...prev, phones: prev.phones.map((p, i) => i === index ? { ...p, [field]: value } : p) }))

  const handlePhonePrimaryChange = (index) =>
    setForm(prev => ({ ...prev, phones: prev.phones.map((p, i) => ({ ...p, is_primary: i === index ? 1 : 0 })) }))

  const addPhone = () =>
    setForm(prev => ({ ...prev, phones: [...prev.phones, { label: '', phone: '', is_primary: 0 }] }))

  const removePhone = (index) =>
    setForm(prev => {
      const phones = prev.phones.filter((_, i) => i !== index)
      const hasPrimary = phones.some(p => p.is_primary === 1)
      if (!hasPrimary && phones.length > 0) phones[0].is_primary = 1
      return { ...prev, phones }
    })

  // ── Qualification handlers ────────────────────────────────────────────────────

  const handleQualificationChange = (type, index, field, value) => {
    const key = type === 'academic' ? 'academic_qualifications' : 'professional_qualifications'
    setForm(prev => ({ ...prev, [key]: prev[key].map((q, i) => i === index ? { ...q, [field]: value } : q) }))
  }

  const addQualification = (type) => {
    const key = type === 'academic' ? 'academic_qualifications' : 'professional_qualifications'
    setForm(prev => ({ ...prev, [key]: [...prev[key], { title: '', completion_date: '' }] }))
  }

  const removeQualification = (type, index) => {
    const key = type === 'academic' ? 'academic_qualifications' : 'professional_qualifications'
    setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      full_name: form.full_name.trim(),
      cnic:      form.cnic.trim(),
      gender:    form.gender,
      phones: form.phones
        .filter(p => p.phone.trim())
        .map(p => ({ label: p.label.trim() || null, phone: p.phone.trim(), is_primary: p.is_primary })),
      qualifications: [
        ...form.academic_qualifications
          .filter(q => q.title.trim())
          .map(q => ({ type: 'academic', title: q.title.trim(), completion_date: q.completion_date || null })),
        ...form.professional_qualifications
          .filter(q => q.title.trim())
          .map(q => ({ type: 'professional', title: q.title.trim(), completion_date: q.completion_date || null })),
      ],
    }

    if (form.name_initials.trim()) payload.name_initials = form.name_initials.trim()
    if (form.marital_status)       payload.marital_status = form.marital_status
    if (form.address.trim())  payload.address        = form.address.trim()
    if (form.employee_no.trim()) payload.employee_no   = form.employee_no.trim()
    if (form.date_of_birth)      payload.date_of_birth = form.date_of_birth
    if (form.joining_date)       payload.joining_date  = form.joining_date
    if (form.email.trim())       payload.email         = form.email.trim()
    payload.isTimetableEligible = form.is_timetable_eligible === 1
    payload.allowConcurrentPeriods = form.allow_concurrent_periods === 1

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <Tabs defaultValue="personal">

        <Separator />

        <TabsList className="w-auto mb-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          {!initialData && <TabsTrigger value="employment">Employment</TabsTrigger>}
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalTab
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

        {!initialData && (
          <TabsContent value="employment">
            <EmploymentTab
              form={form}
              setForm={setForm}
              fieldErrors={fieldErrors}
              saving={saving}
              isCreate
            />
          </TabsContent>
        )}

        <TabsContent value="contacts">
          <ContactsTab
            form={form}
            setForm={setForm}
            phones={form.phones}
            handlePhoneChange={handlePhoneChange}
            handlePhonePrimaryChange={handlePhonePrimaryChange}
            addPhone={addPhone}
            removePhone={removePhone}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="qualifications">
          <QualificationsTab
            academicQualifications={form.academic_qualifications}
            professionalQualifications={form.professional_qualifications}
            handleQualificationChange={handleQualificationChange}
            addQualification={addQualification}
            removeQualification={removeQualification}
            fieldErrors={fieldErrors}
            saving={saving}
          />
        </TabsContent>

      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add Staff Member'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

    </form>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from './StudentField'
import { formatDate } from '@/lib/dateUtils'

export default function StudentPersonalCard({ student }) {
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Personal</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Full Name"         value={student.full_name} />
        <Field label="Gender"            value={student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : null} />
        <Field label="Date of Birth"     value={formatDate(student.date_of_birth)} />
        <Field label="B-Form No"         value={student.b_form_no} />
        <Field label="Blood Group"       value={student.blood_group} />
        <Field label="Religion"          value={student.religion} />
        <Field label="Nationality"       value={student.nationality} />
        <Field label="Domicile District" value={student.domicile_district} />
        <Field label="Father Name"       value={student.father_name} />
        <Field label="Father CNIC"       value={student.father_cnic} />
        <Field label="Father Occupation" value={student.father_occupation} />
        <div className="col-span-2 sm:col-span-3">
          <Field label="Address" value={student.address} />
        </div>
      </CardContent>
    </Card>
  )
}

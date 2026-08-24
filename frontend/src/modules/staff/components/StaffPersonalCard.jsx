import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from './StaffField'
import { formatDate } from '@/lib/dateUtils'

export default function StaffPersonalCard({ staff }) {
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Personal</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="col-span-2 sm:col-span-3">
          <Field label="Full Name" value={staff.full_name} />
        </div>
        <Field label="Initials"        value={staff.name_initials} />
        <Field label="Gender"         value={staff.gender ? (staff.gender === 'male' ? 'Male' : 'Female') : null} />
        <Field label="Marital Status" value={staff.marital_status ? staff.marital_status.charAt(0).toUpperCase() + staff.marital_status.slice(1) : null} />
        <Field label="Date of Birth"  value={formatDate(staff.date_of_birth)} />
        <Field label="CNIC" value={staff.cnic} />
        <div className="col-span-2 sm:col-span-3">
          <Field label="Address" value={staff.address} />
        </div>
      </CardContent>
    </Card>
  )
}

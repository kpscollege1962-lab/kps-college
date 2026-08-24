import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from './StudentField'
import { formatDate } from '@/lib/dateUtils'

export default function StudentAdmissionCard({ student }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Admission</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Field label="GR No"          value={student.gr_no} />
        <Field label="Admission Date" value={formatDate(student.admission_date)} />
      </CardContent>
    </Card>
  )
}

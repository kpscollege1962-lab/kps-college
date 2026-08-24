import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubmittedRegisterTable({ students, records, onBack }) {
  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Class No</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr key={student.studentId}>
                <td className="px-4 py-2">{student.classNo}</td>
                <td className="px-4 py-2">{student.fullName}</td>
                <td className="px-4 py-2 capitalize">{records[student.studentId]?.status ?? '—'}</td>
                <td className="px-4 py-2 text-muted-foreground">{records[student.studentId]?.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="size-3.5 mr-1.5" />
        Back
      </Button>
    </>
  )
}

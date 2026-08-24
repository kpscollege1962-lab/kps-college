import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/dateUtils'

export default function StaffQualificationsCard({ staff }) {
  const academic     = staff.qualifications?.filter(q => q.type === 'academic')     ?? []
  const professional = staff.qualifications?.filter(q => q.type === 'professional') ?? []
  const hasAny       = academic.length > 0 || professional.length > 0

  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Qualifications</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-sm text-muted-foreground">No qualifications recorded.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6">

            {academic.length > 0 && (
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic</p>
                {academic.map((q, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm font-medium">{q.title}</p>
                    {q.completion_date && (
                      <p className="text-xs text-muted-foreground">{formatDate(q.completion_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {academic.length > 0 && professional.length > 0 && (
              <>
                <Separator orientation="horizontal" className="sm:hidden" />
                <Separator orientation="vertical" className="hidden sm:block" />
              </>
            )}

            {professional.length > 0 && (
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Professional</p>
                {professional.map((q, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm font-medium">{q.title}</p>
                    {q.completion_date && (
                      <p className="text-xs text-muted-foreground">{formatDate(q.completion_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  )
}

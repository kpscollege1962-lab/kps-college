import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Can } from '@/casl/AbilityProvider'

export default function RegisterHeader({ session, date, onDateChange, onBack, reopening, onRequestReopen }) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1">
        <h1 className="text-xl font-bold">
          {session.className}{session.sectionName ? ` — ${session.sectionName}` : ''}
        </h1>
        <p className="text-xs text-muted-foreground">
          {session.sessionName}
        </p>
      </div>
      <DatePicker value={date} onChange={onDateChange} className="w-40" />
      <Badge className={session.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
        {session.status === 'submitted' ? 'Submitted' : 'In Progress'}
      </Badge>
      {session.status === 'submitted' && (
        <Can I="reopen" a="Attendance">
          <Button size="sm" variant="outline" onClick={onRequestReopen} disabled={reopening}>
            {reopening ? 'Reopening…' : 'Reopen Register'}
          </Button>
        </Can>
      )}
    </div>
  )
}

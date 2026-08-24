import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentContactsCard({ student }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {student.contacts?.length > 0 ? (
          student.contacts.map((contact, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  contact.is_primary === 1
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/30'
                }`}
                title={contact.is_primary === 1 ? 'Primary' : undefined}
              />
              <span className="font-medium truncate">
                {contact.name || '—'}
              </span>
              <span className="flex items-center gap-2 text-right">
                <span className="font-mono">{contact.phone}</span>
                <span className="text-muted-foreground select-none">·</span>
                <span className="text-muted-foreground text-xs w-16 text-left">{contact.label}</span>
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No contacts recorded.</p>
        )}
      </CardContent>
    </Card>
  )
}

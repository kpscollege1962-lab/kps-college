import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field } from './StaffField'

export default function StaffContactsCard({ staff }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        <Field label="Email" value={staff.email} />

        <Separator />

        {staff.phones?.length > 0 ? (
          staff.phones.map((p, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  p.is_primary === 1 ? 'bg-green-500' : 'bg-muted-foreground/30'
                }`}
                title={p.is_primary === 1 ? 'Primary' : undefined}
              />
              <span className="font-mono">{p.phone}</span>
              {p.label && (
                <span className="text-xs text-muted-foreground">{p.label}</span>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No phone numbers recorded.</p>
        )}

      </CardContent>
    </Card>
  )
}

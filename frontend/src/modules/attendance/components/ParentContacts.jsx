import { MessageCircle, Phone } from 'lucide-react'
import { telHref, whatsappHref } from '../utils/attendanceStatus'

// A student's parent / guardian contacts (primary first): "Father · Mr. NAME", the number as a
// call link and a WhatsApp link. A Father contact with no name shows the student's father name.
export default function ParentContacts({ contacts, fatherName }) {
  const list = [...(contacts ?? [])].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  if (list.length === 0) return <span className="text-xs text-muted-foreground">No number saved</span>
  return (
    <div className="space-y-1">
      {list.map((c) => {
        const name = c.name || (/father/i.test(c.label ?? '') ? fatherName : null)
        return (
          <div key={c.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">
              {[c.label, name].filter(Boolean).join(' · ') || 'Contact'}
            </span>
            {c.phone && (
              <>
                <a href={telHref(c.phone)} className="inline-flex items-center gap-1 font-mono font-medium text-foreground hover:underline">
                  <Phone className="size-3 print:hidden" />{c.phone}
                </a>
                <a
                  href={whatsappHref(c.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 print:hidden"
                  title="WhatsApp"
                  aria-label={`WhatsApp ${c.phone}`}
                >
                  <MessageCircle className="size-3.5" />
                </a>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

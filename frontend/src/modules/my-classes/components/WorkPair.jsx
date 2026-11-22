import { cn } from '@/lib/utils'
import RichText from '@/modules/homework/components/RichText'

// Classwork and homework of one box, side by side (left / right) when both are short;
// one under the other when either text is long or the screen is narrow.
const LONG_TEXT = 60

const textOf = (record) => record.description?.trim() || (record.attachment_url ? 'See attached file' : '—')
const lineText = (record, index, count) => (count > 1 ? `${index + 1}. ${textOf(record)}` : textOf(record))

const isLong = (records) =>
  records.length > 2 || records.some((r) => textOf(r).length > LONG_TEXT || textOf(r).includes('\n'))

function Work({ label, records }) {
  return (
    <div className="flex min-w-0 gap-3 px-4 py-2.5 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1 space-y-1">
        {records.length === 0 ? (
          <p className="text-muted-foreground">—</p>
        ) : (
          records.map((record, i) => (
            <p key={record.id} dir="auto" className="whitespace-pre-wrap break-words">
              <RichText text={lineText(record, i, records.length)} />
            </p>
          ))
        )}
      </div>
    </div>
  )
}

export default function WorkPair({ classwork = [], homework = [] }) {
  const stacked = isLong(classwork) || isLong(homework)
  return (
    <div
      className={cn(
        'grid divide-y divide-border/60',
        !stacked && 'sm:grid-cols-2 sm:divide-x sm:divide-y-0'
      )}
    >
      <Work label="Class work:" records={classwork} />
      <Work label="Home work:" records={homework} />
    </div>
  )
}

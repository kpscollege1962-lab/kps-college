import { parseLocalDate } from '@/lib/dateUtils'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const itemText = (a) => a.description?.trim() || (a.attachment_url ? 'See attached file' : '—')

// The sheet adds its own curly quotes, so remove any quote marks typed around the text.
const cleanQuote = (q) => (q ?? '').trim().replace(/^["“”]+|["“”]+$/g, '').trim()

function WorkRow({ label, items }) {
  return (
    <div className="flex min-h-[3rem] border-b border-black last:border-b-0">
      <div className="w-24 shrink-0 px-2 py-1.5 text-xs font-semibold leading-tight">
        {label[0]}<br />{label[1]}
      </div>
      <div className="flex-1 space-y-1 px-3 py-1.5 text-sm leading-snug">
        {items.map((a, i) => (
          <p key={a.id}>{items.length > 1 ? `${i + 1}. ` : ''}{itemText(a)}</p>
        ))}
      </div>
    </div>
  )
}

function ClassBox({ title, classwork, homework }) {
  return (
    <div className="break-inside-avoid border-y-[3px] border-black">
      <div className="border-b border-black py-1 text-center text-xs font-bold uppercase tracking-wide">{title}</div>
      <WorkRow label={['Class', 'work']} items={classwork} />
      <WorkRow label={['Home', 'work']} items={homework} />
    </div>
  )
}

// classes: the teacher's classes, each { classGroupId, sectionId, className, sectionName, subjects: [{id, name}] }
// quote: optional text; when empty, no quote line is shown.
export default function HomeworkSheet({ teacherName, dueDate, classes, assignments, quote }) {
  const date = dueDate ? parseLocalDate(dueDate) : null
  const quoteText = cleanQuote(quote)

  const boxes = classes.flatMap((cls) =>
    cls.subjects.map((subject) => {
      const matching = assignments.filter(
        (a) => a.class_group_id === cls.classGroupId && a.section_id === cls.sectionId && a.subject_id === subject.id
      )
      return {
        key: `${cls.classGroupId}-${cls.sectionId}-${subject.id}`,
        title: `${cls.className}${cls.sectionName ? ` — ${cls.sectionName}` : ''} · ${subject.name}`,
        classwork: matching.filter((a) => a.type === 'classwork'),
        homework: matching.filter((a) => a.type === 'homework'),
      }
    })
  )

  return (
    <div
      className="flex min-h-[296mm] w-[210mm] flex-col bg-[#a9ddf7] px-[12mm] py-[10mm] text-black"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      {/* TODO: school letterhead (Printheader) and watermark (PrintWatermark) slot in here later */}

      <p dir="rtl" className="mb-3 text-center font-serif text-2xl">بسم اللہ الرحمن الرحیم</p>

      {/* Centre column sizes to the title (no wrapping); name and date share the rest equally */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <p className="text-lg font-bold uppercase leading-tight text-[#b8235a]">{teacherName}</p>
        <h1 className="whitespace-nowrap text-center font-serif text-[22px] font-bold uppercase leading-tight">
          Assignments of the Day
        </h1>
        <div className="text-right text-lg font-bold leading-tight text-[#b8235a]">
          {date && (
            <>
              <p>{WEEKDAYS[date.getDay()]}</p>
              <p>{MONTHS[date.getMonth()]} {date.getDate()} {date.getFullYear()}</p>
            </>
          )}
        </div>
      </div>

      {quoteText && (
        <p dir="auto" className="mt-4 text-center font-serif text-xl font-bold text-[#1e4fa3]">
          “{quoteText}”
        </p>
      )}

      <div className="mt-4 space-y-4">
        {boxes.map((box) => (
          <ClassBox key={box.key} title={box.title} classwork={box.classwork} homework={box.homework} />
        ))}
      </div>

      <p dir="rtl" className="mt-auto pt-6 text-center font-serif text-lg leading-loose">
        <span className="underline">محترم والدین / سرپرست صاحبان!</span> آپ سب سے گزارش ہے کہ سکول میں دیئے گئے آج کے کام کے حوالے سے اپنے بچے / بچوں کی اچھی طرح رہنمائی ونگرانی کیجیئے تاکہ بچوں میں زیادہ سے زیادہ بہتری جلد سے جلد دیکھی جاسکے۔ شکریہ۔
      </p>
    </div>
  )
}
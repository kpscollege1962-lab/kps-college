import '@fontsource/noto-nastaliq-urdu/arabic-400.css'
import { parseLocalDate } from '@/lib/dateUtils'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Noori Nastaliq is used if it is installed or added to the project; otherwise Noto Nastaliq Urdu.
const URDU_FONT = "'Noori Nastaliq', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif"

// TODO: this single quote will later come from an admin-managed list.
const REPORT_QUOTE = 'It is impossible for a man to learn what he thinks he already knows.'

const itemText = (a) => a.description?.trim() || (a.attachment_url ? 'See attached file' : '—')

function WorkRow({ label, items }) {
  return (
    <div className="flex min-h-[3rem] border-b border-black last:border-b-0">
      <div className="w-16 shrink-0 px-3 py-2 text-sm font-bold">{label}</div>
      <div className="flex-1 space-y-1 px-3 py-1.5 text-sm leading-snug">
        {items.map((a, i) => (
          <p key={a.id}>{items.length > 1 ? `${i + 1}. ` : ''}{itemText(a)}</p>
        ))}
      </div>
    </div>
  )
}

// Each class sits in its own bordered box.
function ClassBox({ title, classwork, homework }) {
  return (
    <div className="break-inside-avoid border-[3px] border-black">
      <div className="border-b border-black py-1 text-center text-xs font-bold uppercase tracking-wide">{title}</div>
      <WorkRow label="CW" items={classwork} />
      <WorkRow label="HW" items={homework} />
    </div>
  )
}

// classes: the teacher's classes, each { classGroupId, sectionId, className, sectionName, subjects: [{id, name}] }
export default function HomeworkSheet({ teacherName, dueDate, classes, assignments }) {
  const date = dueDate ? parseLocalDate(dueDate) : null

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

      <p dir="rtl" className="mb-3 text-center text-2xl" style={{ fontFamily: URDU_FONT, lineHeight: 2.2 }}>
        بسم اللہ الرحمن الرحیم
      </p>

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

      <p className="my-5 text-center font-serif text-xl font-bold text-[#1e4fa3]">
        “{REPORT_QUOTE}”
      </p>

      <div className="space-y-3">
        {boxes.map((box) => (
          <ClassBox key={box.key} title={box.title} classwork={box.classwork} homework={box.homework} />
        ))}
      </div>

      <p dir="rtl" className="mt-auto pt-6 text-center text-[15px]" style={{ fontFamily: URDU_FONT, lineHeight: 2.6 }}>
        <span className="underline underline-offset-8">محترم والدین / سرپرست صاحبان!</span> آپ سب سے گزارش ہے کہ سکول میں دیئے گئے آج کے کام کے حوالے سے اپنے بچے / بچوں کی اچھی طرح رہنمائی ونگرانی کیجیئے تاکہ بچوں میں زیادہ سے زیادہ بہتری جلد سے جلد دیکھی جاسکے۔ شکریہ۔
      </p>
    </div>
  )
}
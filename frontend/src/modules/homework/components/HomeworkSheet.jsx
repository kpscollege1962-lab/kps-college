import { forwardRef } from 'react'
import { parseLocalDate } from '@/lib/dateUtils'
import { URDU_FONT } from '../constants/fonts'
import { DEFAULT_QUOTE } from '../constants/quotes'
import { buildSheetBoxes } from '../utils/sheetBoxes'
import FitToPage from './FitToPage'
import RichText from './RichText'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const cleanQuote = (q) => String(q ?? '').trim().replace(/^["“”]+|["“”]+$/g, '').trim()

const itemText = (a, index, count) => {
  const text = a.description?.trim() || (a.attachment_url ? 'See attached file' : '—')
  return count > 1 ? `${index + 1}. ${text}` : text
}

function WorkRow({ label, items }) {
  return (
    <div className="flex min-h-[3rem] border-b border-black last:border-b-0">
      <div className="w-16 shrink-0 px-3 py-2 text-sm font-bold">{label}</div>
      <div className="flex-1 space-y-1 px-3 py-1.5 text-sm leading-snug">
        {items.map((a, i) => (
          <p key={a.id} dir="auto"><RichText text={itemText(a, i, items.length)} /></p>
        ))}
      </div>
    </div>
  )
}

function ClassBox({ title, classwork, homework }) {
  return (
    <div className="break-inside-avoid border-[3px] border-black">
      <div className="border-b border-black py-1 text-center text-xs font-bold uppercase tracking-wide">
        <RichText text={title} ordinal />
      </div>
      <WorkRow label="CW" items={classwork} />
      <WorkRow label="HW" items={homework} />
    </div>
  )
}


const HomeworkSheet = forwardRef(function HomeworkSheet(
  { label, view, dueDate, assignments, quote = DEFAULT_QUOTE, onFit },
  ref
) {
  const date = dueDate ? parseLocalDate(dueDate) : null
  const boxes = buildSheetBoxes(view, assignments)
  const quoteText = cleanQuote(quote)

  return (
    <FitToPage
      ref={ref}
      onFit={onFit}
      className="sheet-page"
      innerClassName="flex flex-col px-[12mm] py-[10mm] text-black"
      style={{ background: '#a9ddf7', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >

      <p dir="rtl" className="mb-3 text-center text-2xl" style={{ fontFamily: URDU_FONT, lineHeight: 2.2 }}>
        بسم اللہ الرحمن الرحیم
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <p dir="auto" className="text-lg font-bold uppercase leading-tight text-[#b8235a]">
          <RichText text={label} ordinal />
        </p>
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
          “<RichText text={quoteText} />”
        </p>
      )}

      <div className="mt-4 space-y-3">
        {boxes.map((box) => (
          <ClassBox key={box.key} title={box.title} classwork={box.classwork} homework={box.homework} />
        ))}
      </div>

      <p dir="rtl" className="mt-auto pt-6 text-center text-[15px]" style={{ fontFamily: URDU_FONT, lineHeight: 2.6 }}>
        <span className="underline underline-offset-8">محترم والدین / سرپرست صاحبان!</span> آپ سب سے گزارش ہے کہ سکول میں دیئے گئے آج کے کام کے حوالے سے اپنے بچے / بچوں کی اچھی طرح رہنمائی ونگرانی کیجیئے تاکہ بچوں میں زیادہ سے زیادہ بہتری جلد سے جلد دیکھی جاسکے۔ شکریہ۔
      </p>
    </FitToPage>
  )
})

export default HomeworkSheet
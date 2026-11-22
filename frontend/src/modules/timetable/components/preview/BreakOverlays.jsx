// Break strips for a preview cell that holds SEVERAL classes (a teacher or subject with more than
// one class in the same period). Each class takes its break before or after the period; the cell
// shows a strip for every side its classes use: "before" on the left, "after" on the right.
// The strips are overlays (full cell height, no layout space): pad the cell content with
// breakPadding(sides) from utils/breakSides.js so text never runs under them.

export default function BreakOverlays({ sides, narrow = false }) {
  const width = narrow ? 'w-4' : 'w-6'
  const text = narrow ? 'text-[8px]' : 'text-[9px]'
  return (
    <>
      {sides.has('before') && (
        <div className={`absolute inset-y-0 left-0 ${width} bg-amber-500/10 border-r border-amber-500/40 flex items-center justify-center`}>
          <span className={`${text} text-amber-600 dark:text-amber-400 rotate-90 whitespace-nowrap`}>Break</span>
        </div>
      )}
      {sides.has('after') && (
        <div className={`absolute inset-y-0 right-0 ${width} bg-blue-500/10 border-l border-blue-500/40 flex items-center justify-center`}>
          <span className={`${text} text-blue-600 dark:text-blue-400 rotate-90 whitespace-nowrap`}>Break</span>
        </div>
      )}
    </>
  )
}

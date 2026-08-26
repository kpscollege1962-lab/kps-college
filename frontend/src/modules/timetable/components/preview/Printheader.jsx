// Renders inside .timetable-print-target (above the table) so it is included
// in the print output — anything outside that container is hidden by the
// `body:has(.timetable-print-target) *` visibility:hidden rule in print CSS.
export default function PrintHeader({ titleUrl, monogramUrl }) {
  if (!titleUrl && !monogramUrl) return null

  return (
    <div className="timetable-print-header flex items-center gap-3 mb-3 pb-2 border-b border-border">
      {monogramUrl && (
        <img
          src={monogramUrl}
          alt="Monogram"
          className="h-12 w-12 object-contain shrink-0"
        />
      )}
      {titleUrl && (
        <img
          src={titleUrl}
          alt="Title"
          className="h-10 max-w-[320px] object-contain shrink-0"
        />
      )}
    </div>
  )
}
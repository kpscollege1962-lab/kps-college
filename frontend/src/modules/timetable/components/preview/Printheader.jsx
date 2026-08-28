// Renders inside .timetable-print-target (above the table) so it is included
// in the print output — anything outside that container is hidden by the
// `body:has(.timetable-print-target) *` visibility:hidden rule in print CSS.
// The uploaded title image is expected to already contain the school's
// logo/monogram combined with its name (a banner), so it's scaled to the
// full width of the timetable instead of a fixed small height.
export default function PrintHeader({ titleUrl }) {
  if (!titleUrl) return null

  return (
    <div className="timetable-print-header mb-3 pb-2 border-b border-border">
      <img
        src={titleUrl}
        alt="Title"
        className="w-full h-auto object-contain"
      />
    </div>
  )
}
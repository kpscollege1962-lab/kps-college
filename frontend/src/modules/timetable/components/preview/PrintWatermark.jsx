// Sits absolutely-positioned behind the table content, inside
// .timetable-print-target so it's included in the print output (not stripped
// by the visibility:hidden print rule, since it targets that container's
// descendants specifically). Parent must be `position: relative`.
export default function PrintWatermark({ watermarkUrl }) {
  if (!watermarkUrl) return null

  return (
    <div
      className="timetable-print-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <img
        src={watermarkUrl}
        alt=""
        className="max-w-[70%] max-h-[70%] object-contain opacity-10"
      />
    </div>
  )
}
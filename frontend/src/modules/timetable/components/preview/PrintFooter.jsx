// Free-text footer shown below the table on the printed timetable (e.g.
// "Principal\nKPS & COLLEGE\nKhwaza Khela Swat"), set once per campus on the
// Campuses page. white-space: pre-line turns each \n into its own line.
export default function PrintFooter({ footerText }) {
  if (!footerText) return null

  return (
    <div
      className="mt-8 pt-3 text-right text-xs font-medium text-foreground leading-snug"
      style={{ whiteSpace: 'pre-line' }}
    >
      {footerText}
    </div>
  )
}
export default function PrintFooter({ footerText }) {
  if (!footerText) return null

  return (
    <div className="mt-8 pt-3 flex justify-end">
      <div
        className="text-left text-xs font-medium text-foreground leading-snug"
        style={{ whiteSpace: 'pre-line' }}
      >
        {footerText}
      </div>
    </div>
  )
}
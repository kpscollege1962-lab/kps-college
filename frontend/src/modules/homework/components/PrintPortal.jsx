import { createPortal } from 'react-dom'

// Renders children at <body> level. On screen it's hidden; when printing, it is
// the ONLY thing shown, so the sheet prints cleanly regardless of the app layout.
const PRINT_CSS = `
.print-root { display: none; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { margin: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
  body > *:not(.print-root) { display: none !important; }
  .print-root { display: block !important; }
}
`

export default function PrintPortal({ children }) {
  return createPortal(
    <div className="print-root">
      <style>{PRINT_CSS}</style>
      {children}
    </div>,
    document.body
  )
}
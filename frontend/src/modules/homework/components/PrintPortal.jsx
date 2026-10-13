import { createPortal } from 'react-dom'


const PRINT_CSS = `
.print-root { position: fixed; left: -99999px; top: 0; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body {
    margin: 0 !important; padding: 0 !important;
    width: 210mm !important; height: 296mm !important;
    overflow: hidden !important; background: #fff !important;
  }
  body > *:not(.print-root) { display: none !important; }
  .print-root { position: static !important; display: block !important; }
  .print-root .sheet-page { height: 296mm !important; break-inside: avoid; page-break-inside: avoid; }
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
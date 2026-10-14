import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'

const MIN_SCALE = 0.4

// A fixed A4 page. If the content is taller than the page it is scaled down (the content
// is also made wider by the same factor, so it still fills the page width).
// `behind` is drawn centred on the page itself (e.g. a watermark) and is never scaled.
const FitToPage = forwardRef(function FitToPage(
  { children, behind, className, innerClassName, style, onFit },
  ref
) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const onFitRef = useRef(onFit)
  onFitRef.current = onFit

  useImperativeHandle(ref, () => outerRef.current)

  const fit = () => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const pageHeight = outer.clientHeight
    if (!pageHeight) return

    const apply = (scale) => {
      inner.style.width = `${100 / scale}%`
      inner.style.transform = `scale(${scale})`
      return inner.offsetHeight * scale
    }

    let scale = 1
    let height = apply(scale)
    for (let i = 0; i < 8 && height > pageHeight && scale > MIN_SCALE; i += 1) {
      scale = Math.max(MIN_SCALE, scale * (pageHeight / height) * 0.995)
      height = apply(scale)
    }

    onFitRef.current?.({ scale: Math.round(scale * 1000) / 1000, overflow: height > pageHeight + 1 })
  }

  useLayoutEffect(() => { fit() })

  useEffect(() => {
    const inner = innerRef.current
    let alive = true
    const refit = () => { if (alive) fit() }
    document.fonts?.ready?.then(refit)
    document.fonts?.addEventListener?.('loadingdone', refit)
    inner?.addEventListener('load', refit, true)
    return () => {
      alive = false
      document.fonts?.removeEventListener?.('loadingdone', refit)
      inner?.removeEventListener('load', refit, true)
    }
  }, [])

  return (
    <div
      ref={outerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', width: '210mm', height: '297mm', ...style }}
    >
      {behind && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}
        >
          {behind}
        </div>
      )}
      <div ref={innerRef} className={innerClassName} style={{ position: 'relative', transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
})

export default FitToPage
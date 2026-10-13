import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'

const MIN_SCALE = 0.4


const FitToPage = forwardRef(function FitToPage({ children, className, innerClassName, style, onFit }, ref) {
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
      inner.style.minHeight = '0px'
      inner.style.transform = `scale(${scale})`
      return inner.offsetHeight * scale
    }

    let scale = 1
    let height = apply(scale)
    for (let i = 0; i < 8 && height > pageHeight && scale > MIN_SCALE; i += 1) {
      scale = Math.max(MIN_SCALE, scale * (pageHeight / height) * 0.995)
      height = apply(scale)
    }
    // Short content: stretch to the page so the Urdu note sits at the bottom.
    inner.style.minHeight = `${pageHeight / scale}px`

    onFitRef.current?.({ scale: Math.round(scale * 1000) / 1000, overflow: height > pageHeight + 1 })
  }

  useLayoutEffect(() => { fit() })

  // Re-measure once web fonts finish loading (the Urdu font changes line heights).
  useEffect(() => {
    let alive = true
    const refit = () => { if (alive) fit() }
    document.fonts?.ready?.then(refit)
    document.fonts?.addEventListener?.('loadingdone', refit)
    return () => {
      alive = false
      document.fonts?.removeEventListener?.('loadingdone', refit)
    }
  }, []) 

  return (
    <div
      ref={outerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', width: '210mm', height: '297mm', ...style }}
    >
      <div ref={innerRef} className={innerClassName} style={{ transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
})

export default FitToPage
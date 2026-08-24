import { useEffect, useRef } from 'react'

const INTERACTIVE = 'input, button, select, textarea, [role="combobox"], a'
const THRESHOLD   = 5

export const useDragScroll = (ref) => {
  const state = useRef({
    active:   false,
    dragging: false,
    startX:   0,
    startY:   0,
    scrollX:  0,
    scrollY:  0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMouseDown = (e) => {
      if (e.button !== 0) return
      if (e.target.closest(INTERACTIVE)) return
      const s = state.current
      s.dragging = true
      s.active   = false
      s.startX   = e.clientX
      s.startY   = e.clientY
      s.scrollX  = el.scrollLeft
      s.scrollY  = el.scrollTop
    }

    const onMouseMove = (e) => {
      const s = state.current
      if (!s.dragging) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      if (!s.active) {
        if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return
        s.active            = true
        el.style.cursor     = 'grabbing'
        el.style.userSelect = 'none'
      }
      el.scrollLeft = s.scrollX - dx
      el.scrollTop  = s.scrollY - dy
    }

    const onMouseUp = () => {
      const s = state.current
      if (!s.dragging) return
      s.dragging = false
      if (s.active) {
        s.active            = false
        el.style.cursor     = ''
        el.style.userSelect = ''
      }
    }

    el.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
      el.style.cursor     = ''
      el.style.userSelect = ''
    }
  }, [ref])
}

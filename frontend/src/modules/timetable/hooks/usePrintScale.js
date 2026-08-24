import { useCallback, useRef } from 'react'

export const usePrintScale = () => {
  const gridRef = useRef(null)

  const print = useCallback(() => {
    window.print()
  }, [])

  return { gridRef, print }
}

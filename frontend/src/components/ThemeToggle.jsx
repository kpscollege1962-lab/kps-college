import { useSelector, useDispatch } from 'react-redux'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleTheme } from '@/ui/state/ui.slice'

export default function ThemeToggle() {
  const theme = useSelector((state) => state.ui.theme)
  const dispatch = useDispatch()

  return (
    <Button variant="outline" size="icon" onClick={() => dispatch(toggleTheme())}>
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}

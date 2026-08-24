import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <p className="text-lg font-medium text-foreground">Page not found</p>
      <Button variant="outline">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  )
}

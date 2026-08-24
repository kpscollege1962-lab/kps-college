import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Facebook,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import APP_CONFIG from '@/lib/config'

const features = [
  { icon: GraduationCap, label: 'Students' },
  { icon: Users, label: 'Teachers' },
  { icon: BookOpen, label: 'Classes' },
  { icon: ClipboardList, label: 'Attendance' },
  { icon: CreditCard, label: 'Fees' },
  { icon: CalendarDays, label: 'Exams' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="w-full border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight text-foreground">
          {APP_CONFIG.APP_NAME}
        </span>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* School badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground border border-border rounded-full px-3 py-1 mb-6">
          <MapPin className="w-3 h-3" />
          Khyber Public School And College · Swat
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground max-w-xl">
          Academic management,{' '}
          <span className="text-primary">simplified.</span>
        </h1>

        <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-md">
          {APP_CONFIG.APP_NAME} is the all-in-one platform for KPS — managing
          students, teachers, attendance, fees, and exams across all campuses.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <Link to="/portal" className={cn(buttonVariants({ size: 'lg' }))}>
            Go to Portal
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {features.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 border border-border rounded-full px-3 py-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-xs font-semibold text-foreground mb-3">
            Khyber Public School And College (KPS)
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              Matta Road, Khwaza Khela, Swat
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3 shrink-0" />
              0348-9021577 · 0348-9021578
            </span>
            <a
              href="mailto:kps.college1962@gmail.com"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="w-3 h-3 shrink-0" />
              kps.college1962@gmail.com
            </a>
            <a
              href="https://fb.com/kpscollegeswat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Facebook className="w-3 h-3 shrink-0" />
              fb.com/kpscollegeswat
            </a>
          </div>
          <Separator className="my-3" />
          <p className="text-center text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. Built for KPS.
          </p>
        </div>
      </footer>
    </div>
  )
}

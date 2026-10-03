import { useEffect } from 'react'
import { NavLink, Outlet, useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useMyTeachingClasses } from '../hooks/useMyTeachingClasses'

const TABS = [
  { path: 'students', label: 'Students' },
  { path: 'homework', label: 'Homework' },
]

export default function MyClassLayout() {
  const { classGroupId, sectionId } = useParams()
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const { classes, fetchClasses } = useMyTeachingClasses(campusId)

  useEffect(() => {
    if (campusId) fetchClasses()
  }, [campusId, fetchClasses])

  const current = classes.find(
    (c) => String(c.classGroupId) === classGroupId && String(c.sectionId) === sectionId
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/portal/my-classes" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {current ? `${current.className}${current.sectionName ? ` — ${current.sectionName}` : ''}` : 'Class'}
          </h1>
          {current && <p className="text-sm text-muted-foreground mt-0.5">{current.subjects.map(s => s.name).join(', ')}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => cn(
              'px-3 py-2 text-sm border-b-2 -mb-px',
              isActive ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
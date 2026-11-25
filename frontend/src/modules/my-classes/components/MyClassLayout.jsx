import { useEffect } from 'react'
import { NavLink, Outlet, useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useMyTeachingClasses } from '../hooks/useMyTeachingClasses'
import { useMyFormMasterClasses } from '../hooks/useMyFormMasterClasses'

const TABS = [
  { path: 'students', label: 'Students' },
  // Only the class's form master (Period 1 teacher, or today's rota cover of Period 1).
  { path: 'attendance', label: 'Attendance', formMasterOnly: true },
  // more tabs later: quizzes, marks...
]

export default function MyClassLayout() {
  const { classGroupId, sectionId } = useParams()
  const { activeRole } = useRoleContext()
  const campusId = activeRole?.campusId

  const { classes, fetchClasses } = useMyTeachingClasses(campusId)

  useEffect(() => {
    if (campusId) fetchClasses()
  }, [campusId, fetchClasses])

  const { classes: formMasterOf } = useMyFormMasterClasses(campusId)
  const isFormMaster = formMasterOf.some(
    (c) => String(c.classGroupId) === classGroupId && String(c.sectionId) === sectionId
  )
  const tabs = TABS.filter((t) => !t.formMasterOnly || isFormMaster)

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
          {current && <p className="text-sm text-muted-foreground mt-0.5">{current.subjects.map((s) => s.name).join(', ')}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
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
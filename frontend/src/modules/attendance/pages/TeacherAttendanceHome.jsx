import { Link, Navigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useMyFormMasterClasses } from '@/modules/my-classes/hooks/useMyFormMasterClasses'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'

const tabOf = (c) => `/portal/my-classes/${c.classGroupId}/${c.sectionId}/attendance`

// Sidebar → Attendance for a teacher: attendance lives on the class page (Attendance tab) of the
// classes they are form master of. One class opens it directly; several are listed.
export default function TeacherAttendanceHome() {
  const { activeRole } = useRoleContext()
  const { classes, loaded, error } = useMyFormMasterClasses(activeRole?.campusId)

  if (!loaded) return <Skeleton className="h-32 w-full rounded-2xl" />
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (classes.length === 1) return <Navigate to={tabOf(classes[0])} replace />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Each class&apos;s attendance is taken by its form master (the Period 1 teacher).
        </p>
      </div>
      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          You do not have Period 1 in any class, so there is no attendance for you to take.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link
              key={c.key}
              to={tabOf(c)}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30"
            >
              <p className="text-base font-semibold"><RichText text={classLabelText(c.className, c.sectionName)} ordinal /></p>
              <p className="mt-1 text-xs text-muted-foreground">{c.viaRota ? 'Rota today: you cover Period 1' : 'Form master'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

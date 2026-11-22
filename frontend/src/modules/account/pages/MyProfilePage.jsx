import { useNavigate } from 'react-router'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate } from '@/lib/dateUtils'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import RichText from '@/modules/homework/components/RichText'
import { classLabelText } from '@/modules/homework/utils/labels'
import { Field } from '@/modules/staff/components/StaffField'
import StaffPersonalCard from '@/modules/staff/components/StaffPersonalCard'
import StaffContactsCard from '@/modules/staff/components/StaffContactsCard'
import StaffQualificationsCard from '@/modules/staff/components/StaffQualificationsCard'
import StudentPersonalCard from '@/modules/students/components/StudentPersonalCard'
import StudentAdmissionCard from '@/modules/students/components/StudentAdmissionCard'
import StudentContactsCard from '@/modules/students/components/StudentContactsCard'
import { useMyProfile } from '../hooks/useMyProfile'
import PersonAvatar from '../components/PersonAvatar'

const roleText = (name) =>
  String(name ?? '').toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

// The signed-in person's own details, read-only (top-right menu → My Profile).
// Teachers / staff see their staff record, students their student record, admin accounts their
// account. Changes go through Settings (photo, email, phone, password) or the school office.
export default function MyProfilePage() {
  const navigate = useNavigate()
  const { profile, loading, error } = useMyProfile()
  const { activeRole } = useRoleContext()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>

  const { user, staff, student } = profile
  const name = staff?.full_name ?? student?.full_name ?? [user.first_name, user.last_name].filter(Boolean).join(' ')
  const postings = staff?.postings ?? []
  const enrollment = student?.enrollments?.[0] ?? null

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile</p>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <PersonAvatar user={user} className="size-16 text-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              {[roleText(activeRole?.roleName), activeRole?.campusName].filter(Boolean).join(' · ')}
            </p>
            <p className="text-xs text-muted-foreground">
              Username: <span className="font-mono">{user.username}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/portal/account')}>
            <Settings className="mr-1.5 size-3.5" />
            Settings
          </Button>
        </CardContent>
      </Card>

      {staff && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StaffPersonalCard staff={staff} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Employment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {postings.length === 0 && <p className="text-sm text-muted-foreground">No active posting.</p>}
              {postings.map((p) => (
                <div key={p.id} className="grid grid-cols-2 gap-4">
                  <Field label="Campus" value={p.campus?.name} />
                  <Field label="Employee No" value={p.employee_no} />
                  <Field label="Joining Date" value={formatDate(p.joining_date)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <StaffContactsCard staff={staff} />
          <StaffQualificationsCard staff={staff} />
        </div>
      )}

      {student && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StudentPersonalCard student={student} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Class</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Field
                label="Class"
                value={enrollment ? <RichText text={classLabelText(enrollment.classGroup?.name, enrollment.section?.name)} ordinal /> : null}
              />
              <Field label="Session" value={enrollment?.session?.name} />
              <Field label="Class No" value={enrollment?.class_no} />
            </CardContent>
          </Card>
          <StudentAdmissionCard student={student} />
          <StudentContactsCard student={student} />
        </div>
      )}

      {!staff && !student && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Name" value={name} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

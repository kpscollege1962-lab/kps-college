import { useParams } from 'react-router'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import RegisterEditor from '@/modules/attendance/components/RegisterEditor'

// Class page → Attendance tab: the form master (Period 1 teacher) takes and submits the
// class's attendance. The server refuses anyone else.
export default function MyClassAttendancePage() {
  const { sectionId } = useParams()
  const { activeRole } = useRoleContext()
  return <RegisterEditor campusId={activeRole?.campusId} sectionId={Number(sectionId)} />
}

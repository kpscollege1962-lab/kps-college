// Attendance statuses, quick reasons and contact links shared by the form master's register and
// the admin screens.

export const STATUSES = [
  { value: 'present', short: 'P',  label: 'Present',
    active: 'bg-emerald-600 text-white border-emerald-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', row: '' },
  { value: 'absent',  short: 'A',  label: 'Absent',
    active: 'bg-red-600 text-white border-red-600', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    row: 'bg-red-50 dark:bg-red-950/30' },
  { value: 'late',    short: 'L',  label: 'Late',
    active: 'bg-amber-500 text-white border-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    row: 'bg-amber-50/70 dark:bg-amber-950/20' },
  { value: 'leave',   short: 'Lv', label: 'Leave',
    active: 'bg-blue-600 text-white border-blue-600', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    row: 'bg-blue-50/70 dark:bg-blue-950/20' },
]
export const statusMeta = (value) => STATUSES.find((s) => s.value === value) ?? null

// One-tap reasons for Absent / Late / Leave (the teacher may also type their own).
export const QUICK_REASONS = {
  absent: ['Sick', 'Family reason', 'Not informed', 'Out of town'],
  late:   ['Transport', 'Doctor visit', 'Not informed'],
  leave:  ['Sick leave', 'Family reason', 'Approved leave'],
}

export const countMarks = (students, marks) => {
  const counts = { present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 }
  for (const s of students) {
    const st = marks[s.studentId]?.status
    if (st) counts[st] += 1
    else counts.unmarked += 1
  }
  return counts
}

// Phone links: call, and WhatsApp (Pakistani numbers "03xx..." become "923xx...").
export const telHref = (phone) => `tel:${String(phone ?? '').replace(/[^\d+]/g, '')}`
export const whatsappHref = (phone) => {
  let digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`
  else if (digits.length === 10 && digits.startsWith('3')) digits = `92${digits}`
  return `https://wa.me/${digits}`
}

export const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

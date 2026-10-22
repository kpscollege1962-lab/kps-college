import {
  LayoutDashboard, Building2, GraduationCap, Landmark, ClipboardCheck,
  User, Settings, Shield, ScrollText, CalendarCheck, Bell, BellRing,
} from 'lucide-react'
import ROLES from '@/constants/roles'

const {
  SUPER_ADMIN, SCHOOL_ADMIN, CAMPUS_ADMIN, PRINCIPAL, TEACHER,
  EXAM_CONTROLLER, ACCOUNTANT, RECEPTIONIST, GUARDIAN, STUDENT,
} = ROLES

/*
 * ONE menu for every role. Every role sees the whole structure; each entry says where it goes.
 *
 *   roles   who sees the entry. Leave it out and EVERY role sees it (that is how the client's
 *           general list works). Set it for role-specific pages, e.g. Classes or Fees.
 *   page    the real page it opens
 *   live    optional: only these roles get the real page, the other roles in `roles`
 *           still see the entry but it opens "yet to be implemented"
 *   pages   use instead of page/live when the real page differs per role:
 *           { SUPER_ADMIN: '/portal/settings', CAMPUS_ADMIN: '/portal/campus-settings' }
 *   noHighlight  roles for which this entry opens a page that another entry already shows,
 *           so it is not highlighted a second time
 *
 * To hide a general entry from some roles, give it a `roles` list.
 *
 * An entry with no real page for a role opens "yet to be implemented".
 * When a feature gets built, add its `page` (and `live` if needed). Nothing else changes.
 */
export const SOON_PREFIX = '/portal/soon'

export const MASTER_NAV = [
  { id: 'overview', title: 'Overall overview', icon: LayoutDashboard, page: '/portal' },
  { id: 'campuses', title: 'Campuses', icon: Building2, page: '/portal/campuses', roles: [SUPER_ADMIN] },

  {
    type: 'group', id: 'academics', title: 'Academics', icon: GraduationCap,
    items: [
      { id: 'timetable', title: 'Timetable', page: '/portal/timetable', live: [SUPER_ADMIN, CAMPUS_ADMIN, STUDENT] },
      { id: 'classes', title: 'Classes', page: '/portal/classes', roles: [SUPER_ADMIN, CAMPUS_ADMIN] },
      { id: 'class-teachers', title: 'Class Teachers', page: '/portal/class-teacher-assignments', roles: [SUPER_ADMIN, CAMPUS_ADMIN] },
      { id: 'my-classes', title: 'My Classes', page: '/portal/my-classes', roles: [TEACHER] },
      { id: 'enrollments', title: 'Enrollments', page: '/portal/enrollments', roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
      { id: 'subjects', title: 'Subjects', page: '/portal/subjects', roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
      { id: 'course-content', title: 'Course / subject content' },
      { id: 'homework', title: 'Homework, timetable subject based',
        pages: { [SUPER_ADMIN]: '/portal/assignments', [TEACHER]: '/portal/my-classes' }, noHighlight: [TEACHER] },
      { id: 'notebook-checking', title: 'Notebook checking activity schedule and recorded data' },
      { id: 'periodic-reports', title: 'Daily / monthly / annual reports' },
      { id: 'syllabus', title: 'Syllabus' },
      { id: 'attendance', title: 'Attendance with daily / monthly / annual reports', page: '/portal/attendance',
        live: [SUPER_ADMIN, CAMPUS_ADMIN, TEACHER, STUDENT] },
      { id: 'reports-generation', title: 'Reports generation' },
      { id: 'session-closing', title: 'Daily / monthly / annual session closing' },
      { id: 'lecture-view', title: 'Lecture view for smartboard / projector' },
    ],
  },

  {
    type: 'group', id: 'accounts', title: 'Accounts / finance', icon: Landmark,
    items: [
      { id: 'finance-overview', title: 'Overall overview' },
      { id: 'fees', title: 'Fees', page: '/portal/fees', roles: [SUPER_ADMIN, CAMPUS_ADMIN, ACCOUNTANT] },
      { id: 'my-fees', title: 'My Fees', page: '/portal/my-fees', live: [STUDENT], roles: [STUDENT, GUARDIAN] },
      { id: 'personal-account', title: 'Personal account detail' },
      { id: 'pay-scale', title: 'Pay scale and increment policy' },
      { id: 'account-reports', title: 'Monthly / annual account reports' },
    ],
  },

  {
    type: 'group', id: 'examination', title: 'Examination', icon: ClipboardCheck,
    items: [
      { id: 'exam-schedule', title: 'Exam schedule' },
      { id: 'exam-enrollments', title: "Students' enrollments" },
      { id: 'date-sheets', title: 'Date sheets and roll numbers' },
      { id: 'exam-syllabus', title: 'Course syllabus, exam tenure based' },
      { id: 'model-papers', title: 'Model papers' },
      { id: 'entry-tests', title: 'Entry tests schedule and papers' },
      { id: 'paper-making', title: 'Paper making option' },
      { id: 'class-tests', title: 'Class test schedule and papers along with results' },
      { id: 'answer-checking', title: 'Answer paper checking and uploads' },
      { id: 'result-entry', title: 'Result entry' },
      { id: 'result-overview', title: 'Result overview and personal reports' },
    ],
  },

  {
    type: 'group', id: 'profile', title: 'Profile', icon: User,
    items: [
      { id: 'staff-profiles', title: 'Staff profiles', page: '/portal/staff', live: [SUPER_ADMIN, CAMPUS_ADMIN] },
      { id: 'student-profiles', title: "Students' profiles", page: '/portal/students',
        live: [SUPER_ADMIN, SCHOOL_ADMIN, ACCOUNTANT] },
      { id: 'own-profile', title: 'Self / own profile' },
    ],
  },

  { type: 'divider', id: 'basics-divider' },

  { id: 'settings', title: 'Settings', icon: Settings,
    pages: { [SUPER_ADMIN]: '/portal/settings', [CAMPUS_ADMIN]: '/portal/campus-settings' } },
  { id: 'campus-settings', title: 'Campus settings', icon: Settings, page: '/portal/campus-settings', roles: [SUPER_ADMIN] },
  { id: 'privacy', title: 'Privacy', icon: Shield },
  { id: 'terms', title: 'Terms and conditions', icon: ScrollText },
  { id: 'session', title: 'Session', icon: CalendarCheck,
    pages: { [SUPER_ADMIN]: '/portal/academic-sessions', [SCHOOL_ADMIN]: '/portal/academic-sessions' } },
  { id: 'notices', title: 'Notices and notification', icon: Bell },
  { id: 'alerts', title: 'Alerts', icon: BellRing },
]

const visibleTo = (entry, roleName) => !entry.roles || entry.roles.includes(roleName)

const pageFor = (entry, roleName) => {
  if (entry.pages) return entry.pages[roleName] ?? null
  if (!entry.page) return null
  if (entry.live && !entry.live.includes(roleName)) return null
  return entry.page
}

const toLeaf = (entry, roleName) => {
  const page = pageFor(entry, roleName)
  return {
    id: entry.id,
    title: entry.title,
    icon: entry.icon,
    path: page ?? `${SOON_PREFIX}/${entry.id}`,
    soon: !page,
    noHighlight: !!entry.noHighlight?.includes(roleName),
  }
}

export const resolveNavTree = (activeRole) => {
  const roleName = activeRole?.roleName
  if (!roleName) return []

  const tree = []
  for (const entry of MASTER_NAV) {
    if (entry.type === 'divider') {
      tree.push({ type: 'divider', id: entry.id })
    } else if (entry.type === 'group') {
      const items = entry.items.filter((item) => visibleTo(item, roleName)).map((item) => toLeaf(item, roleName))
      if (items.length) tree.push({ type: 'group', id: entry.id, title: entry.title, icon: entry.icon, items })
    } else if (visibleTo(entry, roleName)) {
      tree.push({ type: 'item', ...toLeaf(entry, roleName) })
    }
  }

  return tree.filter((e, i, all) => e.type !== 'divider' || (i > 0 && i < all.length - 1 && all[i - 1].type !== 'divider'))
}

// For the "yet to be implemented" page: the entry's title and the group it sits in.
export const findNavEntry = (id) => {
  for (const entry of MASTER_NAV) {
    if (entry.type === 'group') {
      const item = entry.items.find((i) => i.id === id)
      if (item) return { title: item.title, groupTitle: entry.title }
    } else if (entry.id === id && entry.type !== 'divider') {
      return { title: entry.title, groupTitle: null }
    }
  }
  return null
}
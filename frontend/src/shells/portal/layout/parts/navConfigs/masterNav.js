import {
  LayoutDashboard, Building2, GraduationCap, Landmark, ClipboardCheck, User, Settings,
} from 'lucide-react'
import ROLES from '@/constants/roles'

const {
  SUPER_ADMIN, SCHOOL_ADMIN, CAMPUS_ADMIN, PRINCIPAL, TEACHER,
  ACCOUNTANT, RECEPTIONIST, STUDENT,
} = ROLES

/*
 * ONE menu for every role (the client's "sidebar design").
 *
 * Entries:
 *   { id, title, icon, page }                       a single entry
 *   { type: 'group', id, title, icon, items: [...] } a group; its items can hold sub-groups
 *   { type: 'divider', id }
 *
 * Options on an entry:
 *   roles   who sees it. Leave it out and EVERY role sees it. Set it for role-specific pages.
 *   page    the real page it opens
 *   live    optional: only these roles get the real page, the other roles in `roles`
 *           still see the entry but it opens "yet to be implemented"
 *   pages   use instead of page/live when the real page differs per role:
 *           { SUPER_ADMIN: '/portal/settings', CAMPUS_ADMIN: '/portal/campus-settings' }
 *   noHighlight    roles for which this entry opens a page another entry already shows,
 *                  so it is not highlighted a second time
 *   collapseWhenSingle   (group) when a role is left with a single entry in the group, show
 *                  just that entry instead of a one-item group
 *   opens   (group) id of the entry that opens by itself when the group is clicked open
 *
 * An entry with no real page for a role opens "yet to be implemented".
 * When a feature gets built, give its entry a `page` (and `live` if needed). Nothing else changes.
 */
export const SOON_PREFIX = '/portal/soon'

export const MASTER_NAV = [
  { id: 'home', title: 'Home', icon: LayoutDashboard, page: '/portal' },
  { id: 'campuses', title: 'Campuses', icon: Building2, page: '/portal/campuses', roles: [SUPER_ADMIN] },

  {
    type: 'group', id: 'academics', title: 'Academics', icon: GraduationCap,
    items: [
            {
        // Clicking Classes opens the class page itself: class management for admins, the timetable
        // and assignments for a teacher. The entries below are the rest of the class tools.
          type: 'group', id: 'classes-group', title: 'Classes',
           pages: { [SUPER_ADMIN]: '/portal/classes', [CAMPUS_ADMIN]: '/portal/classes', [TEACHER]: '/portal/my-classes' },
            items: [
          { id: 'class-teachers', title: 'Class teachers', page: '/portal/class-teacher-assignments', roles: [SUPER_ADMIN, CAMPUS_ADMIN] },
          { id: 'enrollments', title: 'Enrollments', page: '/portal/enrollments', roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
          { id: 'subjects', title: 'Subjects', page: '/portal/subjects', roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
          // Teachers see their own timetable at the top of Manage classes.
          { id: 'timetable', title: 'Timetable',
            pages: { [SUPER_ADMIN]: '/portal/timetable', [CAMPUS_ADMIN]: '/portal/timetable', [STUDENT]: '/portal/timetable', [TEACHER]: '/portal/my-classes' },
            noHighlight: [TEACHER] },
          // Teachers post homework and classwork inside My classes, so theirs opens the same page.
          { id: 'homework', title: 'Homework',
            pages: { [SUPER_ADMIN]: '/portal/assignments', [TEACHER]: '/portal/my-classes' }, noHighlight: [TEACHER] },
          { id: 'attendance', title: 'Attendance', page: '/portal/attendance',
            live: [SUPER_ADMIN, CAMPUS_ADMIN, TEACHER, STUDENT] },
          { id: 'notebook-checking', title: 'Notebooks checking' },
          { id: 'class-reports', title: 'Reports' },
        ],
      },
      {
        type: 'group', id: 'lecture-group', title: 'Lecture',
        items: [
          { id: 'lecture-home', title: 'Home' },
          { id: 'course-content', title: 'Course content' }, // planned: RAG/LLM attachment
          { id: 'syllabus', title: 'Syllabus' },
        ],
      },
    ],
  },

  {
    type: 'group', id: 'accounts', title: 'Accounts / finance', icon: Landmark,
    items: [
      {
        type: 'group', id: 'payments-overview-group', title: 'Overview',
        items: [
          { id: 'last-payment', title: 'Detail of the last payment made' },
          { id: 'pending-payments', title: 'Pending payments with due date', pages: { [STUDENT]: '/portal/my-fees' } },
        ],
      },
      { id: 'fees', title: 'Fees', page: '/portal/fees', roles: [SUPER_ADMIN, CAMPUS_ADMIN, ACCOUNTANT] },
    ],
  },

  {
    type: 'group', id: 'examination', title: 'Examination', icon: ClipboardCheck,
    items: [
      { id: 'exam-schedule', title: 'Schedule' },
      { id: 'course-articulation', title: 'Course articulation' },
      {
        type: 'group', id: 'papers-group', title: 'Papers',
        items: [
          { id: 'question-papers', title: 'Question papers' },
          { id: 'answer-papers', title: 'Answer papers' },
          { id: 'model-papers', title: 'Model papers' },
        ],
      },
      {
        type: 'group', id: 'exam-enrollment-group', title: 'Enrollment',
        items: [
          { id: 'award-list', title: 'Award list and result entry' },
        ],
      },
      { id: 'paper-making', title: 'Paper making' },
      { id: 'entry-tests', title: 'Entry Tests Record' },
      {
        type: 'group', id: 'exam-reports-group', title: 'Reports',
        items: [
          { id: 'dmcs', title: 'DMCs and roll Nos.' },
          { id: 'evaluation-reports', title: 'Evaluation reports' },
          { id: 'exam-attendance', title: 'Attendance' },
        ],
      },
    ],
  },

  {
    // Everyone has "My profile". Looking at other people's profiles is for the roles that manage them.
    type: 'group', id: 'profile', title: 'Profile', icon: User, collapseWhenSingle: true,
    items: [
      { id: 'students-profile', title: "Students' profile", page: '/portal/students',
        live: [SUPER_ADMIN, SCHOOL_ADMIN, ACCOUNTANT],
        roles: [SUPER_ADMIN, SCHOOL_ADMIN, CAMPUS_ADMIN, PRINCIPAL, ACCOUNTANT, RECEPTIONIST] },
      { id: 'staff-profile', title: "Staff's profile", page: '/portal/staff',
        live: [SUPER_ADMIN, CAMPUS_ADMIN],
        roles: [SUPER_ADMIN, SCHOOL_ADMIN, CAMPUS_ADMIN, PRINCIPAL] },
      { id: 'users-profile', title: "Users' profile", roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
      { id: 'my-profile', title: 'My profile' },
    ],
  },

  { type: 'divider', id: 'settings-divider' },

  {
    type: 'group', id: 'settings', title: 'Settings', icon: Settings,
    items: [
      { id: 'school-settings', title: 'School settings', pages: { [SUPER_ADMIN]: '/portal/settings' },
        roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
      { id: 'campus-settings', title: 'Campus settings',
        pages: { [SUPER_ADMIN]: '/portal/campus-settings', [CAMPUS_ADMIN]: '/portal/campus-settings' },
        roles: [SUPER_ADMIN, SCHOOL_ADMIN, CAMPUS_ADMIN] },
      { id: 'sessions', title: 'Sessions', page: '/portal/academic-sessions', roles: [SUPER_ADMIN, SCHOOL_ADMIN] },
    ],
  },
]

const visibleTo = (entry, roleName) => !entry.roles || entry.roles.includes(roleName)

const pageFor = (entry, roleName) => {
  if (entry.pages) return entry.pages[roleName] ?? null
  if (!entry.page) return null
  if (entry.live && !entry.live.includes(roleName)) return null
  return entry.page
}

const toItem = (entry, roleName) => {
  const page = pageFor(entry, roleName)
  return {
    type: 'item',
    id: entry.id,
    title: entry.title,
    icon: entry.icon,
    path: page ?? `${SOON_PREFIX}/${entry.id}`,
    soon: !page,
    noHighlight: !!entry.noHighlight?.includes(roleName),
  }
}


const resolveEntries = (entries, roleName) => {
  const out = []
  for (const entry of entries) {
    if (entry.type === 'divider') {
      out.push({ type: 'divider', id: entry.id })
    } else if (!visibleTo(entry, roleName)) {
      continue
    } else if (entry.type === 'group') {
      const items = resolveEntries(entry.items, roleName)
      if (!items.length) continue // empty groups are dropped
      if (entry.collapseWhenSingle && items.length === 1 && items[0].type === 'item') {
        out.push({ ...items[0], icon: entry.icon })
      } else {
        out.push({ type: 'group', id: entry.id, title: entry.title, icon: entry.icon, items, opensPath: pageFor(entry, roleName) })
      }
    } else {
      out.push(toItem(entry, roleName))
    }
  }
  return out
}

// The menu for one role: [{ type: 'item' | 'group' | 'divider', ... }]; groups can hold groups.
export const resolveNavTree = (activeRole) => {
  const roleName = activeRole?.roleName
  if (!roleName) return []

  // no divider at the very start, the very end, or twice in a row
  return resolveEntries(MASTER_NAV, roleName).filter(
    (e, i, all) => e.type !== 'divider' || (i > 0 && i < all.length - 1 && all[i - 1].type !== 'divider')
  )
}

// For the "yet to be implemented" page: the entry's title and where it sits ("Academics / Classes").
export const findNavEntry = (id, entries = MASTER_NAV, trail = []) => {
  for (const entry of entries) {
    if (entry.type === 'group') {
      const hit = findNavEntry(id, entry.items, [...trail, entry.title])
      if (hit) return hit
    } else if (entry.type !== 'divider' && entry.id === id) {
      return { title: entry.title, groupTitle: trail.length ? trail.join(' / ') : null }
    }
  }
  return null
}
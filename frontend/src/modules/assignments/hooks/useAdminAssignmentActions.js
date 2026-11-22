import { useCallback, useState } from 'react'
import { joinRecordTexts } from '@/modules/my-classes/utils/assignmentBoxes'
import {
  adminUpdateAssignmentService, adminDeleteAssignmentService,
  adminRestoreAssignmentService, adminPurgeAssignmentService,
} from '../services/assignments.service'

const TYPES = ['classwork', 'homework']

// Admin changes to teachers' assignments. A "box" is one teacher's classwork + homework for one
// class, subject and pair of dates (see groupAssignmentBoxes with byTeacher).
// Admins cannot post: a box's classwork or homework that does not exist is never created here.
export const useAdminAssignmentActions = (campusId) => {
  const [saving, setSaving] = useState(false)

  const run = useCallback(async (fn) => {
    setSaving(true)
    try { return await fn() } finally { setSaving(false) }
  }, [])

  // Same rules as the teacher's edit: an emptied field removes (soft-deletes) that work, and
  // several records of one kind are joined into the first one. Dates apply to the whole box.
  const saveBox = useCallback(({ box, classwork, homework, assignedDate, dueDate }) => run(async () => {
    const texts = { classwork: classwork.trim(), homework: homework.trim() }
    const datesChanged = assignedDate !== box.assignedDate || dueDate !== box.dueDate
    const dates = { assignedDate, dueDate }

    for (const type of TYPES) {
      const records = box.records[type]
      if (!records.length) continue
      const next = texts[type]

      if (!next) {
        for (const r of records) {
          const result = await adminDeleteAssignmentService(campusId, r.id)
          if (!result.success) return result
        }
        continue
      }

      const [first, ...extra] = records
      if (next !== joinRecordTexts(records)) {
        const result = await adminUpdateAssignmentService(campusId, first.id, { description: next, ...dates })
        if (!result.success) return result
        for (const r of extra) {
          const removed = await adminDeleteAssignmentService(campusId, r.id)
          if (!removed.success) return removed
        }
      } else if (datesChanged) {
        for (const r of records) {
          const result = await adminUpdateAssignmentService(campusId, r.id, dates)
          if (!result.success) return result
        }
      }
    }
    return { success: true }
  }), [campusId, run])

  const deleteOne = useCallback((record) => run(() => adminDeleteAssignmentService(campusId, record.id)), [campusId, run])

  // A whole box: its classwork and homework (soft delete; each can be restored).
  const deleteBox = useCallback((box) => run(async () => {
    for (const r of [...box.records.classwork, ...box.records.homework]) {
      const result = await adminDeleteAssignmentService(campusId, r.id)
      if (!result.success) return result
    }
    return { success: true }
  }), [campusId, run])
  const restore   = useCallback((record) => run(() => adminRestoreAssignmentService(campusId, record.id)), [campusId, run])
  const purge     = useCallback((record) => run(() => adminPurgeAssignmentService(campusId, record.id)), [campusId, run])

  return { saving, saveBox, deleteOne, deleteBox, restore, purge }
}

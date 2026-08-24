import api from '@/lib/api'

export const listRegisterEntriesApi  = (studentId)              =>
  api.get(`/students/${studentId}/register-entries`)

export const upsertRegisterEntryApi  = (studentId, level, data) =>
  api.put(`/students/${studentId}/register-entries/${level}`, data)

export const deleteRegisterEntryApi  = (studentId, level)       =>
  api.delete(`/students/${studentId}/register-entries/${level}`)

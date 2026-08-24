import { handleApiCall } from '@/lib/apiUtils'
import {
  listRegisterEntriesApi,
  upsertRegisterEntryApi,
  deleteRegisterEntryApi,
} from '../api/registerEntries.api'

export const listRegisterEntriesService = (studentId) =>
  handleApiCall(() => listRegisterEntriesApi(studentId), 'Failed to fetch register entries')

export const upsertRegisterEntryService = (studentId, level, data) =>
  handleApiCall(() => upsertRegisterEntryApi(studentId, level, data), 'Failed to save register entry')

export const deleteRegisterEntryService = (studentId, level) =>
  handleApiCall(() => deleteRegisterEntryApi(studentId, level), 'Failed to remove register entry')

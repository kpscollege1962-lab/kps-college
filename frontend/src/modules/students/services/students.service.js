import { handleApiCall } from '@/lib/apiUtils'
import {
  listStudentsApi,
  getStudentApi,
  createStudentApi,
  updateStudentApi,
} from '../api/students.api'

export const listStudentsService  = (params)         =>
  handleApiCall(() => listStudentsApi(params),              'Failed to fetch students')

export const getStudentService    = (studentId)       =>
  handleApiCall(() => getStudentApi(studentId),             'Failed to fetch student')

export const createStudentService = (data)            =>
  handleApiCall(() => createStudentApi(data),               'Failed to create student')

export const updateStudentService = (studentId, data) =>
  handleApiCall(() => updateStudentApi(studentId, data),    'Failed to update student')

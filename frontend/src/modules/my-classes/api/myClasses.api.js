import api from '@/lib/api'

export const listMyTeachingClassesApi = (campusId) =>
  api.get('/teacher/my-classes', { params: { campusId } })
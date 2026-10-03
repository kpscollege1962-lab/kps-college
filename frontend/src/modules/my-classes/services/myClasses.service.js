import { handleApiCall } from '@/lib/apiUtils'
import { listMyTeachingClassesApi } from '../api/myClasses.api'

export const listMyTeachingClassesService = (campusId) =>
  handleApiCall(() => listMyTeachingClassesApi(campusId), 'Failed to fetch your classes')
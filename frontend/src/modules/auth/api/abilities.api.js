import api from '@/lib/api'

// GET /roles/abilities?roleId=:roleId&campusId=:campusId
// roleId is always required. campusId omitted for global roles (SUPER_ADMIN etc.)
export const fetchAbilitiesApi = (roleId, campusId) =>
  api.get('/roles/abilities', {
    params: {
      roleId,
      ...(campusId ? { campusId } : {}),
    },
  })

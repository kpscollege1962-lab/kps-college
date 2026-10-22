import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectRoleThunk } from '../store/roleContext.thunks'
import { clearRoleContext, setWorkingCampus } from '../store/roleContext.slice'

// Global roles that work INSIDE a campus picked in the sidebar instead of belonging to one.
const CAMPUS_PICKER_ROLES = ['SUPER_ADMIN']

export const useRoleContext = () => {
  const dispatch = useDispatch()

  const { activeRole: baseRole, rules, selectStatus, workingCampus } = useSelector(
    (state) => state.roleContext
  )
  const contexts = useSelector((state) => state.auth.contexts)

  const canPickCampus =
    !!baseRole && baseRole.layer === 'global' && CAMPUS_PICKER_ROLES.includes(baseRole.roleName)

 
  const activeRole = useMemo(() => {
    if (!baseRole || !canPickCampus || !workingCampus) return baseRole
    return { ...baseRole, campusId: workingCampus.id, campusName: workingCampus.name }
  }, [baseRole, canPickCampus, workingCampus])

  const selectRole = (context) =>
    dispatch(selectRoleThunk({ context })).unwrap()

  const clearContext = () => dispatch(clearRoleContext())

  const pickCampus = (campus) =>
    dispatch(setWorkingCampus(campus ? { id: campus.id, name: campus.name } : null))

  return {
    activeRole,
    baseRole,
    rules,
    selectStatus,
    contexts,
    canPickCampus,
    workingCampus: canPickCampus ? workingCampus ?? null : null,

    selectRole,
    clearContext,
    setWorkingCampus: pickCampus,
  }
}
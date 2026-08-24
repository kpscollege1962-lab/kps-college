import { useDispatch, useSelector } from 'react-redux'
import { selectRoleThunk } from '../store/roleContext.thunks'
import { clearRoleContext } from '../store/roleContext.slice'

export const useRoleContext = () => {
  const dispatch = useDispatch()

  const { activeRole, rules, selectStatus } = useSelector(
    (state) => state.roleContext
  )
  const contexts = useSelector((state) => state.auth.contexts)

  // Select (or switch to) a context
  const selectRole = (context) =>
    dispatch(selectRoleThunk({ context })).unwrap()

  const clearContext = () => dispatch(clearRoleContext())

  return {
    // state
    activeRole,
    rules,
    selectStatus,
    contexts,

    // actions
    selectRole,
    clearContext,
  }
}

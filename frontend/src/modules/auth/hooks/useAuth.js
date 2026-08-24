import { useDispatch, useSelector } from 'react-redux'
import { loginThunk, logoutThunk } from '../store/auth.thunks'

export const useAuth = () => {
  const dispatch = useDispatch()

  const { user, roles, accessToken, refreshToken, isAuthenticated, loginStatus, logoutStatus } =
    useSelector((state) => state.auth)

  const login = (credentials) => dispatch(loginThunk(credentials)).unwrap()

  const logout = () => dispatch(logoutThunk()).unwrap()

  return {
    // state
    user,
    roles,
    accessToken,
    refreshToken,
    isAuthenticated,
    loginStatus,
    logoutStatus,

    // actions
    login,
    logout
  }
}

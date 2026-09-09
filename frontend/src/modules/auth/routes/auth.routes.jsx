import LoginPage from '../pages/LoginPage'
import StudentLoginPage from '../pages/StudentLoginPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'

export const authRoutes = [
  { path: 'login', element: <LoginPage /> },
  { path: 'student-login', element: <StudentLoginPage /> },
  { path: 'forgot-password', element: <ForgotPasswordPage /> },
  { path: 'reset-password', element: <ResetPasswordPage /> },
]
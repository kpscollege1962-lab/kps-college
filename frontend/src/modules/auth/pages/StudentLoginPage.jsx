import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import StudentLoginForm from '../components/StudentLoginForm'
import APP_CONFIG from '@/lib/config'

export default function StudentLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/portal'

  const { studentLogin } = useAuth()

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errors, setErrors] = useState({})

  const handleLogin = async (data) => {
    setLoading(true)
    setErrorMessage(null)
    setErrors({})

    try {
      await studentLogin(data)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong')
      if (err.data?.errors) setErrors(err.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Brand */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Student Portal</h1>
        <p className="text-sm text-muted-foreground">Sign in to your {APP_CONFIG.APP_NAME} account</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <StudentLoginForm
          loading={loading}
          errors={errors}
          errorMessage={errorMessage}
          onSubmit={handleLogin}
        />
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { resetPasswordService } from '../services/auth.service'
import ResetPasswordForm from '../components/ResetPasswordForm'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errors, setErrors] = useState({})

  const handleSubmit = async ({ password }) => {
    if (!token) {
      setErrorMessage('Reset token is missing. Please use the link from your email.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setErrors({})

    try {
      const result = await resetPasswordService({ token, password })
      if (!result.success) throw result

      navigate('/auth/login', { state: { passwordReset: true }, replace: true })
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
        <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">
              This reset link is invalid or has expired.
            </p>
          </div>
        ) : (
          <ResetPasswordForm
            loading={loading}
            errors={errors}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
          />
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

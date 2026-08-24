import { useState } from 'react'
import { Link } from 'react-router'
import { forgotPasswordService } from '../services/auth.service'
import ForgotPasswordForm from '../components/ForgotPasswordForm'
import APP_CONFIG from '@/lib/config'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState(null)
  const [resetKey, setResetKey] = useState(0)

  const handleSubmit = async (data) => {
    setLoading(true)
    setErrorMessage(null)
    setErrors({})
    setSuccessMessage(null)

    try {
      const result = await forgotPasswordService(data)
      if (!result.success) throw result

      setSuccessMessage('If that email is registered, a reset link has been sent. Check your inbox — it expires in 60 minutes.')
      setResetKey((k) => k + 1)
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
        <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your {APP_CONFIG.APP_NAME} email and we'll send you a reset link
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <ForgotPasswordForm
          key={resetKey}
          loading={loading}
          errors={errors}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onSubmit={handleSubmit}
        />

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

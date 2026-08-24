import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginForm({ loading = false, errors = {}, errorMessage = null, onSubmit }) {
  const [form, setForm] = useState({ login: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const { fieldErrors = {} } = errors

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>

      {/* Login */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email or Username</label>
        <Input
          name="login"
          value={form.login}
          onChange={handleChange}
          autoComplete="username"
          placeholder="you@school.com"
          required
        />
        {fieldErrors.login && (
          <p className="text-xs text-destructive">{fieldErrors.login}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        )}

        <div className="flex items-center justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Non-field error */}
      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
      </Button>
    </form>
  )
}

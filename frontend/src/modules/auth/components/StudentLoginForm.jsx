import { useState } from 'react'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function StudentLoginForm({ loading = false, errors = {}, errorMessage = null, onSubmit }) {
  const [form, setForm] = useState({ gr_no: '', dob: '' })

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

      {/* B-Form No */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">GR-Number</label>
        <Input
          name="gr_no"
          value={form.gr_no}
          onChange={handleChange}
          autoComplete="username"
          placeholder="e.g. 3310112345671"
          required
        />
        {fieldErrors.bFormNo && (
          <p className="text-xs text-destructive">{fieldErrors.bFormNo}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Date of Birth</label>
        <Input
          name="dob"
          value={form.dob}
          onChange={handleChange}
          autoComplete="off"
          placeholder="DDMMYYYY, e.g. 09012014"
          inputMode="numeric"
          maxLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">Enter your date of birth as day, month, year with no dashes.</p>
        {fieldErrors.dob && (
          <p className="text-xs text-destructive">{fieldErrors.dob}</p>
        )}
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

      <p className="text-center text-xs text-muted-foreground">
        Staff or admin?{' '}
        <Link to="/auth/login" className="text-foreground hover:underline">
          Sign in here
        </Link>
      </p>
    </form>
  )
}
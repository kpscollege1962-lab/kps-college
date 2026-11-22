import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { Camera, KeyRound, Mail, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateUser } from '@/modules/auth/store/auth.slice'
import { useMyProfile } from '../hooks/useMyProfile'
import {
  updateMyContactService, updateMyPhotoService, changeMyPasswordService,
} from '../services/account.service'
import PersonAvatar from '../components/PersonAvatar'

// Sidebar → Settings: the signed-in person's own account.
//   Name: shown only; it is on official records, so the school office changes it.
//   Photo, email, phone, password: changed here.
export default function AccountSettingsPage() {
  const { profile, loading, error, reload } = useMyProfile()

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
      </div>
    )
  }
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>

  const { user, staff, student } = profile
  const name = staff?.full_name ?? student?.full_name ?? [user.first_name, user.last_name].filter(Boolean).join(' ')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your photo, contact details and password.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserRound className="size-4" />Name</CardTitle>
          <CardDescription>Your name is on official school records and reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">To change your name, please ask the school office.</p>
        </CardContent>
      </Card>

      <PhotoCard user={user} onSaved={reload} />
      <ContactCard user={user} onSaved={reload} />
      <PasswordCard />
    </div>
  )
}

function PhotoCard({ user, onSaved }) {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG or WebP image.')
      return
    }
    setSaving(true)
    setError(null)
    const formData = new FormData()
    formData.append('photo', file)
    const result = await updateMyPhotoService(formData)
    setSaving(false)
    if (!result.success) return setError(result.message)
    dispatch(updateUser({ profile_photo: result.data.user.profile_photo }))
    toast.success('Photo saved')
    onSaved()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Camera className="size-4" />Profile photo</CardTitle>
        <CardDescription>Shown next to your name at the top of the page.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <PersonAvatar user={user} className="size-16 text-lg" />
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={saving}>
          {saving ? 'Uploading…' : user.profile_photo ? 'Change photo' : 'Upload photo'}
        </Button>
        {error && <p className="w-full text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

function ContactCard({ user, onSaved }) {
  const dispatch = useDispatch()
  const [email, setEmail] = useState(user.email ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const changed = email.trim() !== (user.email ?? '') || phone.trim() !== (user.phone ?? '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateMyContactService({ email: email.trim(), phone: phone.trim() })
    setSaving(false)
    if (!result.success) return setError(result.message)
    dispatch(updateUser({ email: result.data.user.email, phone: result.data.user.phone }))
    toast.success('Contact details saved')
    onSaved()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Mail className="size-4" />Email and phone</CardTitle>
        <CardDescription>Your email is used to reset a forgotten password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="set-email">Email</Label>
              <Input id="set-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={saving} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="set-phone">Phone</Label>
              <Input id="set-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" disabled={saving} />
            </div>
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !changed}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  let problem = null
  if (form.newPassword && form.newPassword.length < 8) problem = 'The new password must be at least 8 characters.'
  else if (form.confirm && form.confirm !== form.newPassword) problem = 'The two new passwords do not match.'

  const canSave = !saving && !problem && form.currentPassword && form.newPassword && form.confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    const result = await changeMyPasswordService({ currentPassword: form.currentPassword, newPassword: form.newPassword })
    setSaving(false)
    if (!result.success) return setError(result.message)
    setForm({ currentPassword: '', newPassword: '', confirm: '' })
    toast.success('Password changed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4" />Password</CardTitle>
        <CardDescription>At least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pw-current">Current password</Label>
              <Input id="pw-current" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} disabled={saving} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pw-new">New password</Label>
              <Input id="pw-new" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} disabled={saving} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input id="pw-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} disabled={saving} />
            </div>
          </div>
          {problem && <p className="text-xs text-amber-600 dark:text-amber-400">{problem}</p>}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSave}>{saving ? 'Saving…' : 'Change password'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

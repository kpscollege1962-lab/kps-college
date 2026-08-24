import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PersonalTab({ form, setForm, handleChange, fieldErrors, saving }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      <div className="space-y-1.5">
        <Label>Full Name <span className="text-destructive">*</span></Label>
        <Input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="e.g. AHMED KHAN"
          required
          disabled={saving}
        />
        {fieldErrors.full_name && (
          <p className="text-xs text-destructive">{fieldErrors.full_name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Initials</Label>
        <Input
          name="name_initials"
          value={form.name_initials}
          onChange={handleChange}
          placeholder="e.g. A.K"
          maxLength={20}
          disabled={saving}
        />
        {fieldErrors.name_initials && (
          <p className="text-xs text-destructive">{fieldErrors.name_initials}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Gender <span className="text-destructive">*</span></Label>
        <Select
          value={form.gender}
          onValueChange={(val) => setForm(prev => ({ ...prev, gender: val }))}
          disabled={saving}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors.gender && (
          <p className="text-xs text-destructive">{fieldErrors.gender}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Marital Status</Label>
        <Select
          value={form.marital_status}
          onValueChange={(val) => setForm(prev => ({ ...prev, marital_status: val }))}
          disabled={saving}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="single">Single</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors.marital_status && (
          <p className="text-xs text-destructive">{fieldErrors.marital_status}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Date of Birth</Label>
        <DatePicker
          value={form.date_of_birth}
          onChange={(val) => setForm(prev => ({ ...prev, date_of_birth: val ?? '' }))}
          disabled={saving}
          placeholder="Pick a date"
          fromYear={1940}
          toYear={new Date().getFullYear()}
        />
        {fieldErrors.date_of_birth && (
          <p className="text-xs text-destructive">{fieldErrors.date_of_birth}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>CNIC <span className="text-destructive">*</span></Label>
        <Input
          name="cnic"
          value={form.cnic}
          onChange={handleChange}
          placeholder="e.g. 12345-1234567-1"
          maxLength={15}
          required
          disabled={saving}
        />
        {fieldErrors.cnic && (
          <p className="text-xs text-destructive">{fieldErrors.cnic}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label>Address</Label>
        <Textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="STAFF MEMBER'S HOME ADDRESS"
          disabled={saving}
          rows={2}
        />
        {fieldErrors.address && (
          <p className="text-xs text-destructive">{fieldErrors.address}</p>
        )}
      </div>

    </div>
  )
}

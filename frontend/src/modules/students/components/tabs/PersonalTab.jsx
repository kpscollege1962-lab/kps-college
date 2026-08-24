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

export default function PersonalTab({ form, handleChange, setForm, fieldErrors, saving }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      <div className="space-y-1.5">
        <Label>Full Name <span className="text-destructive">*</span></Label>
        <Input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="e.g. Ali Khan"
          required
          disabled={saving}
        />
        {fieldErrors.full_name && (
          <p className="text-xs text-destructive">{fieldErrors.full_name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Gender <span className="text-destructive">*</span></Label>
        <Select
          value={form.gender}
          onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
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
        <Label>Date of Birth</Label>
        <DatePicker
          value={form.date_of_birth}
          onChange={(val) => setForm((prev) => ({ ...prev, date_of_birth: val }))}
          disabled={saving}
          placeholder="Pick a date"
          fromYear={2000}
          toYear={new Date().getFullYear()}
        />
        {fieldErrors.date_of_birth && (
          <p className="text-xs text-destructive">{fieldErrors.date_of_birth}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>B-Form No</Label>
        <Input
          name="b_form_no"
          value={form.b_form_no}
          onChange={handleChange}
          placeholder="e.g. 12345-1234567-1"
          maxLength={15}
          disabled={saving}
        />
        {fieldErrors.b_form_no && (
          <p className="text-xs text-destructive">{fieldErrors.b_form_no}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Blood Group</Label>
        <Input
          name="blood_group"
          value={form.blood_group}
          onChange={handleChange}
          placeholder="e.g. A+, O-"
          maxLength={5}
          disabled={saving}
        />
        {fieldErrors.blood_group && (
          <p className="text-xs text-destructive">{fieldErrors.blood_group}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Religion</Label>
        <Input
          name="religion"
          value={form.religion}
          onChange={handleChange}
          placeholder="e.g. Islam, Christianity"
          disabled={saving}
        />
        {fieldErrors.religion && (
          <p className="text-xs text-destructive">{fieldErrors.religion}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nationality</Label>
        <Input
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          placeholder="e.g. Pakistani"
          disabled={saving}
        />
        {fieldErrors.nationality && (
          <p className="text-xs text-destructive">{fieldErrors.nationality}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Domicile District</Label>
        <Input
          name="domicile_district"
          value={form.domicile_district}
          onChange={handleChange}
          placeholder="e.g. Mardan, Peshawar"
          disabled={saving}
        />
        {fieldErrors.domicile_district && (
          <p className="text-xs text-destructive">{fieldErrors.domicile_district}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Father Name <span className="text-destructive">*</span></Label>
        <Input
          name="father_name"
          value={form.father_name}
          onChange={handleChange}
          placeholder="e.g. Muhammad Khan"
          required
          disabled={saving}
        />
        {fieldErrors.father_name && (
          <p className="text-xs text-destructive">{fieldErrors.father_name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Father CNIC</Label>
        <Input
          name="father_cnic"
          value={form.father_cnic}
          onChange={handleChange}
          placeholder="e.g. 12345-1234567-1"
          maxLength={15}
          disabled={saving}
        />
        {fieldErrors.father_cnic && (
          <p className="text-xs text-destructive">{fieldErrors.father_cnic}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Father Occupation</Label>
        <Input
          name="father_occupation"
          value={form.father_occupation}
          onChange={handleChange}
          placeholder="e.g. Business, Govt. Employee"
          disabled={saving}
        />
        {fieldErrors.father_occupation && (
          <p className="text-xs text-destructive">{fieldErrors.father_occupation}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label>Address</Label>
        <Textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Student's home address"
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

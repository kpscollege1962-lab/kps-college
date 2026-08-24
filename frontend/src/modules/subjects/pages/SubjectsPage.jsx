import { useEffect, useRef, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Can } from '@/casl/AbilityProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSubjects } from '../hooks/useSubjects'
import SubjectRow from '../components/SubjectRow'
import SubjectDialog from '../components/SubjectDialog'

const CATEGORIES = [
  { value: 'science',  label: 'Science'  },
  { value: 'arts',     label: 'Arts'     },
  { value: 'commerce', label: 'Commerce' },
  { value: 'general',  label: 'General'  },
]

export default function SubjectsPage() {
  const {
    subjects,
    total,
    loading,
    error,
    saving,
    deleting,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects()

  const [dialog, setDialog]                   = useState({ open: false, data: null })
  const [formError, setFormError]             = useState(null)
  const [formFieldErrors, setFormFieldErrors] = useState({})

  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('')
  const debounceRef               = useRef(null)

  useEffect(() => {
    fetchSubjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setFormError(null)
    setFormFieldErrors({})
    setDialog({ open: true, data: null })
  }

  const openEdit = (subject) => {
    setFormError(null)
    setFormFieldErrors({})
    setDialog({ open: true, data: subject })
  }

  const handleDialogOpenChange = (open) => {
    if (!open) {
      setFormError(null)
      setFormFieldErrors({})
    }
    setDialog(prev => ({ ...prev, open }))
  }

  const handleFormSubmit = async (data) => {
    const result = dialog.data
      ? await updateSubject(dialog.data.id, data)
      : await createSubject(data)

    if (result.success) {
      setDialog({ open: false, data: null })
    } else {
      setFormError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setFormFieldErrors(fe)
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSubjects({ search: val, page: 1 })
    }, 300)
  }

  const handleCategoryChange = (val) => {
    const next = val === '__all__' ? '' : val
    setCategory(next)
    fetchSubjects({ category: next || undefined, page: 1 })
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : `${total} subject${total !== 1 ? 's' : ''} in catalogue`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchSubjects()}
            disabled={loading}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Refresh
          </Button>
          <Can I="create" a="Subject">
            <Button size="sm" onClick={openCreate} disabled={saving}>
              <Plus className="size-3.5 mr-1.5" />
              Add Subject
            </Button>
          </Can>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          placeholder="Search subjects…"
          value={search}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
        <Select value={category || '__all__'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-44">
            <span className={cn('flex flex-1 text-left text-sm', !category && 'text-muted-foreground')}>
              {CATEGORIES.find(c => c.value === category)?.label ?? 'All Categories'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">

        {/* Loading skeletons */}
        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-5 py-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </div>
          ))
        )}

        {/* Error */}
        {!loading && error && (
          <div className="px-5 py-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && subjects.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">No subjects found.</p>
          </div>
        )}

        {/* Subject rows */}
        {!loading && !error && subjects.map((subject) => (
          <div key={subject.id} className="px-5">
            <SubjectRow
              subject={subject}
              saving={saving}
              deleting={deleting}
              onEdit={openEdit}
              onDelete={deleteSubject}
            />
          </div>
        ))}

      </div>

      <SubjectDialog
        open={dialog.open}
        onOpenChange={handleDialogOpenChange}
        initialData={dialog.data}
        onSubmit={handleFormSubmit}
        saving={saving}
        error={formError}
        fieldErrors={formFieldErrors}
      />

    </div>
  )
}

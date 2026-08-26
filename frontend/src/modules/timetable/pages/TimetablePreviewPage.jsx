import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, RefreshCw, Printer, Type, Image as ImageIcon, Droplets, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useSessionContext } from '@/shells/portal/hooks/useSessionContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimetablePreview } from '../hooks/useTimetablePreview'
import { usePrintScale } from '../hooks/usePrintScale'
import ClassWisePreview   from '../components/preview/ClassWisePreview'
import StaffWisePreview   from '../components/preview/StaffWisePreview'
import SubjectWisePreview from '../components/preview/SubjectWisePreview'
import '../styles/timetable-preview-print.css'

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-lg" />
    ))}
  </div>
)

const ErrorState = ({ message }) => (
  <p className="text-center text-sm text-muted-foreground py-12">{message}</p>
)

// A file-picker button that shows a filled/active state once an image is set,
// with a small clear (×) affordance to remove it without reopening the picker.
const ImageUploadButton = ({ label, icon: Icon, imageUrl, onSelect, onClear }) => {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  return (
    <div className="flex items-center">
      <Button
        variant={imageUrl ? 'default' : 'outline'}
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="gap-1.5 rounded-r-none"
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Button>
      {imageUrl && (
        <Button
          variant="default"
          size="icon-sm"
          onClick={onClear}
          className="rounded-l-none border-l border-primary-foreground/20"
          title={`Remove ${label.toLowerCase()}`}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

// Manages a single uploaded image as an object URL — select/clear/revoke.
const useImageUpload = () => {
  const [url, setUrl] = useState(null)

  const select = useCallback((file) => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }, [])

  const clear = useCallback(() => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  // Release on unmount
  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { url, select, clear }
}

export default function TimetablePreviewPage() {
  const navigate = useNavigate()

  const { activeRole } = useRoleContext()
  const campusId = activeRole.campusId

  const { activeSession } = useSessionContext()
  const sessionId = activeSession?.id ?? null

  const [activeTab, setActiveTab] = useState('class')

  // ── Print customization: title, monogram, watermark (all images) ────────────
  const titleImg     = useImageUpload()
  const monogramImg  = useImageUpload()
  const watermarkImg = useImageUpload()

  const {
    classData, classLoading, classError, fetchClassWise,
    staffData, staffLoading, staffError, fetchStaffWise,
    subjectData, subjectLoading, subjectError, fetchSubjectWise,
  } = useTimetablePreview()

  const { gridRef, print } = usePrintScale()

  // Refetch on mount and whenever the active session changes. Also refetch
  // staff/subject tabs if they were already loaded, so a session switch
  // refreshes whichever tabs the user has visited, not just the default one.
  useEffect(() => {
    fetchClassWise(campusId, sessionId)
    if (staffData !== null) fetchStaffWise(campusId, sessionId)
    if (subjectData !== null) fetchSubjectWise(campusId, sessionId)
  }, [campusId, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (classError) toast.error(classError) }, [classError])
  useEffect(() => { if (staffError) toast.error(staffError) }, [staffError])
  useEffect(() => { if (subjectError) toast.error(subjectError) }, [subjectError])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'staff' && staffData === null) {
      fetchStaffWise(campusId, sessionId)
    }
    if (tab === 'subject' && subjectData === null) {
      fetchSubjectWise(campusId, sessionId)
    }
  }

  const handleRefresh = () => {
    fetchClassWise(campusId, sessionId)
    if (staffData !== null) fetchStaffWise(campusId, sessionId)
    if (subjectData !== null) fetchSubjectWise(campusId, sessionId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/portal/timetable')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Timetable Preview</h1>
            <p className="text-xs text-muted-foreground">
              {activeSession?.name ?? 'No session selected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ImageUploadButton
            label="Title"
            icon={Type}
            imageUrl={titleImg.url}
            onSelect={titleImg.select}
            onClear={titleImg.clear}
          />

          <ImageUploadButton
            label="Monogram"
            icon={ImageIcon}
            imageUrl={monogramImg.url}
            onSelect={monogramImg.select}
            onClear={monogramImg.clear}
          />

          <ImageUploadButton
            label="Watermark"
            icon={Droplets}
            imageUrl={watermarkImg.url}
            onSelect={watermarkImg.select}
            onClear={watermarkImg.clear}
          />

          <Button variant="ghost" size="icon-sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={print} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="class">Class-wise</TabsTrigger>
          <TabsTrigger value="staff">Staff-wise</TabsTrigger>
          <TabsTrigger value="subject">Subject-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          {classLoading
            ? <LoadingSkeleton />
            : classError
              ? <ErrorState message={classError} />
              : classData
                ? (
                  <ClassWisePreview
                    periods={classData.periods}
                    rows={classData.rows}
                    printRef={gridRef}
                    titleUrl={titleImg.url}
                    monogramUrl={monogramImg.url}
                    watermarkUrl={watermarkImg.url}
                  />
                )
                : null}
        </TabsContent>

        <TabsContent value="staff">
          {staffLoading
            ? <LoadingSkeleton />
            : staffError
              ? <ErrorState message={staffError} />
              : staffData
                ? (
                  <StaffWisePreview
                    staff={staffData}
                    periods={classData?.periods ?? []}
                    printRef={gridRef}
                    titleUrl={titleImg.url}
                    monogramUrl={monogramImg.url}
                    watermarkUrl={watermarkImg.url}
                  />
                )
                : null}
        </TabsContent>

        <TabsContent value="subject">
          {subjectLoading
            ? <LoadingSkeleton />
            : subjectError
              ? <ErrorState message={subjectError} />
              : subjectData
                ? (
                  <SubjectWisePreview
                    subjects={subjectData}
                    periods={classData?.periods ?? []}
                    printRef={gridRef}
                    titleUrl={titleImg.url}
                    monogramUrl={monogramImg.url}
                    watermarkUrl={watermarkImg.url}
                  />
                )
                : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
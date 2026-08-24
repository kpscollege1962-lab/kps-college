import { useState } from 'react'
import { Pencil, Trash2, Plus, MoreHorizontal } from 'lucide-react'
import { useAbility } from '@casl/react'
import { Can, AbilityContext } from '@/casl/AbilityProvider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SectionRow from './SectionRow'
import SectionDialog from './SectionDialog'
import DeleteConfirmDialog from './DeleteConfirmDialog'

const ACADEMIC_LEVEL_LABEL = {
  pre_primary: 'Pre-Primary',
  primary: 'Primary',
  middle: 'Middle',
  secondary: 'Secondary',
  higher_secondary: 'Higher Secondary',
}

export default function ClassCard({
  classGroup,
  saving,
  deleting,
  onEditClass,
  onDeleteClass,
  onAddSection,
  onEditSection,
  onDeleteSection,
}) {
  const [sectionDialog, setSectionDialog] = useState({ open: false, data: null })
  const [sectionError, setSectionError] = useState(null)
  const [sectionFErrors, setSectionFErrors] = useState({})
  const [deleteClassOpen, setDeleteClassOpen] = useState(false)

  const ability  = useAbility(AbilityContext)
  const busy     = saving || deleting
  const sections = classGroup.sections ?? []
  const canEditOrDelete = ability.can('update', 'ClassGroup') || ability.can('delete', 'ClassGroup')

  const openAddSection = () => {
    setSectionError(null)
    setSectionFErrors({})
    setSectionDialog({ open: true, data: null })
  }

  const openEditSection = (section) => {
    setSectionError(null)
    setSectionFErrors({})
    setSectionDialog({ open: true, data: section })
  }

  const handleSectionDialogOpenChange = (open) => {
    if (!open) { setSectionError(null); setSectionFErrors({}) }
    setSectionDialog(prev => ({ ...prev, open }))
  }

  const handleSectionSubmit = async ({ name }) => {
    const result = sectionDialog.data
      ? await onEditSection(classGroup.id, sectionDialog.data.id, name)
      : await onAddSection(classGroup.id, name)
    if (result.success) {
      setSectionDialog({ open: false, data: null })
    } else {
      setSectionError(result.message)
      const fe = result.data?.errors?.fieldErrors ?? result.data?.fieldErrors ?? {}
      setSectionFErrors(fe)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Class header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-foreground truncate">{classGroup.name}</span>
          <Badge variant="secondary" className="text-xs shrink-0">
            L{classGroup.level}
          </Badge>
          <Badge variant="outline" className="text-xs shrink-0">
            {ACADEMIC_LEVEL_LABEL[classGroup.academic_level] ?? classGroup.academic_level}
          </Badge>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Can I="create" a="ClassGroup">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={openAddSection}
              disabled={busy}
              title="Add Section"
            >
              <Plus className="size-3.5" />
            </Button>
          </Can>
          {canEditOrDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({ size: 'icon-sm', variant: 'ghost' })}
                disabled={busy}
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Can I="update" a="ClassGroup">
                  <DropdownMenuItem onClick={() => onEditClass(classGroup)}>
                    <Pencil className="size-3.5 mr-2" />
                    Edit Class
                  </DropdownMenuItem>
                </Can>
                <Can I="delete" a="ClassGroup">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteClassOpen(true)}
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    Delete Class
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Sections body */}
      <div className="px-4 py-2">
        {sections.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1">
            No sections — use <Plus className="inline size-3 mx-0.5" /> to start dividing this class.
          </p>
        ) : (
          <div className="divide-y divide-border/50">
            {sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                classGroupId={classGroup.id}
                saving={saving}
                deleting={deleting}
                onEdit={openEditSection}
                onDelete={onDeleteSection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section add/edit dialog */}
      <SectionDialog
        open={sectionDialog.open}
        onOpenChange={handleSectionDialogOpenChange}
        initialData={sectionDialog.data}
        className={classGroup.name}
        onSubmit={handleSectionSubmit}
        saving={saving}
        error={sectionError}
        fieldErrors={sectionFErrors}
      />

      {/* Delete class confirm dialog */}
      <DeleteConfirmDialog
        open={deleteClassOpen}
        onOpenChange={setDeleteClassOpen}
        title="Delete Class"
        description={`"${classGroup.name}" and all its sections will be permanently removed. This cannot be undone.`}
        onConfirm={() => onDeleteClass(classGroup.id)}
        deleting={deleting}
      />
    </div>
  )
}

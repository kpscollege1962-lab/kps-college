import { Users, Wallet, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ACADEMIC_LEVEL_LABEL = {
  pre_primary: 'Pre-Primary',
  primary: 'Primary',
  middle: 'Middle',
  secondary: 'Secondary',
  higher_secondary: 'Higher Secondary',
}

export default function FeeClassCard({ classGroup, onViewStudents, onAssignFees }) {
  const sectionCount = (classGroup.sections ?? []).length

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-colors">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-semibold text-sm text-foreground truncate">{classGroup.name}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {ACADEMIC_LEVEL_LABEL[classGroup.academic_level] ?? classGroup.academic_level}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {sectionCount} section{sectionCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Footer actions — always visible, never overlapping */}
      <div className="mt-auto grid grid-cols-2 border-t border-border">
        <button
          onClick={onViewStudents}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors border-r border-border"
        >
          <Users className="size-3.5" />
          Students
          <ChevronRight className="size-3 text-muted-foreground" />
        </button>
        <button
          onClick={onAssignFees}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Wallet className="size-3.5" />
          Assign Fees
        </button>
      </div>
    </div>
  )
}
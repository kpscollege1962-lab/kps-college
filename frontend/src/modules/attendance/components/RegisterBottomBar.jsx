import { Button } from '@/components/ui/button'

export default function RegisterBottomBar({ markedCount, total, saving, submitting, allMarked, onSave, onSubmit }) {
  return (
    <div className="sticky bottom-0 -mx-4 md:-mx-6 -mb-4 md:-mb-6 border-t border-border bg-background/95 backdrop-blur px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{markedCount} / {total} marked</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Progress'}
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={submitting || !allMarked}>
          {submitting ? 'Saving & Submitting…' : 'Submit Register'}
        </Button>
      </div>
    </div>
  )
}

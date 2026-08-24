import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100]

function getPageRange(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, '…', totalPages]
  }
  if (page >= totalPages - 3) {
    return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}

export function Pagination({ page, total, limit, onPageChange, onLimitChange, loading }) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1 && !onLimitChange) return null

  const from  = (page - 1) * limit + 1
  const to    = Math.min(page * limit, total)
  const range = getPageRange(page, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

      {/* Left: record count + rows-per-page */}
      <div className="flex items-center gap-3 shrink-0">
        <p className="text-xs text-muted-foreground">
          {total > 0 ? `Showing ${from}–${to} of ${total}` : `${total} records`}
        </p>
        {onLimitChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Rows</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              disabled={loading}
              className="h-7 rounded-md border border-input bg-background px-1.5 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Mobile nav: icon-only arrows + compact X/N indicator ── */}
      {totalPages > 1 && (
        <div className="flex sm:hidden items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-1 text-xs text-muted-foreground whitespace-nowrap">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Desktop nav: Previous + numbered pages + Next ── */}
      {totalPages > 1 && (
        <div className="hidden sm:flex items-center gap-1 min-w-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            className="shrink-0"
          >
            <ChevronLeft />
            Previous
          </Button>

          <div className="flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
            <div className="flex items-center gap-1">
              {range.map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground select-none">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? 'default' : 'outline'}
                    onClick={() => onPageChange(p)}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                )
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="shrink-0"
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      )}

    </div>
  )
}

export default Pagination

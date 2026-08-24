import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Can } from '@/casl/AbilityProvider'

const STATUS_CONFIG = {
  active:      { label: 'Active',      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' },
  transferred: { label: 'Transferred', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0' },
  withdrawn:   { label: 'Withdrawn',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0' },
}

export function getEnrollmentColumns({ page, limit, onDeleteClick, deleting }) {
  return [
    {
      id: 'index',
      header: '#',
      enableSorting: false,
      size: 48,
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {(page - 1) * limit + row.index + 1}
        </span>
      ),
    },
    {
      id: 'class_no',
      header: 'Class No',
      accessorKey: 'class_no',
      size: 80,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
          {getValue()}
        </span>
      ),
    },
    {
      id: 'student',
      header: 'Student',
      accessorFn: (row) => row.student?.full_name ?? '',
      cell: ({ row }) => {
        const student = row.original.student
        return student
          ? <p className="font-medium">{student.full_name}</p>
          : <p className="text-muted-foreground italic">—</p>
      },
    },
    {
      id: 'gr_no',
      header: 'GR No',
      accessorFn: (row) => row.student?.gr_no ?? '',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() || '—'}</span>
      ),
    },
    {
      id: 'campus',
      header: 'Campus',
      accessorFn: (row) => row.campus?.name ?? '',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() || '—'}</span>
      ),
    },
    {
      id: 'class',
      header: 'Class',
      accessorFn: (row) => row.classGroup?.name ?? '',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() || '—'}</span>
      ),
    },
    {
      id: 'section',
      header: 'Section',
      accessorFn: (row) => row.section?.name ?? '',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() || '—'}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue()
        const config = STATUS_CONFIG[status]
        return config
          ? <Badge variant="outline" className={config.className}>{config.label}</Badge>
          : <span className="text-muted-foreground text-sm">—</span>
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      size: 80,
      cell: ({ row }) => (
        <Can I="delete" a="Enrollment">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDeleteClick(row.original)}
            disabled={deleting}
          >
            <Trash2 />
          </Button>
        </Can>
      ),
    },
  ]
}

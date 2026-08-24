import { Link } from 'react-router'
import { formatDate, formatDateNumeric } from '@/lib/dateUtils'

const honorific = (gender) => gender === 'female' ? 'Miss.' : 'Mr.'

export function getStudentColumns({ page, limit }) {
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
      id: 'gr_no',
      header: 'GR No',
      accessorKey: 'gr_no',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue()}</span>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'full_name',
      cell: ({ row }) => {
        const { id, full_name, gender } = row.original
        return (
          <Link
            to={`/portal/students/${id}`}
            className="font-medium hover:underline"
          >
            {honorific(gender)} {full_name}
          </Link>
        )
      },
    },
    {
      id: 'dob',
      header: 'DOB',
      accessorKey: 'date_of_birth',
      cell: ({ getValue }) => {
        const val = getValue()
        const numeric = formatDateNumeric(val)
        const words = formatDate(val)
        if (!numeric) return <span className="text-muted-foreground">—</span>
        return (
          <div className="space-y-0.5">
            <p className="text-sm tabular-nums">{numeric}</p>
            <p className="text-xs text-muted-foreground">{words}</p>
          </div>
        )
      },
    },
    {
      id: 'father',
      header: 'Father Name',
      accessorFn: (row) => row.father_name ?? '',
      cell: ({ row }) => {
        const { father_name } = row.original
        if (!father_name) return <span className="text-muted-foreground">—</span>
        return <span className="text-sm">Mr. {father_name}</span>
      },
    },
    {
      id: 'father_occupation',
      header: 'Father Occupation',
      accessorFn: (row) => row.father_occupation ?? '',
      cell: ({ row }) => {
        const { father_occupation } = row.original
        if (!father_occupation) return <span className="text-muted-foreground">—</span>
        return <span className="text-sm">{father_occupation}</span>
      },
    },
    {
      id: 'address',
      header: 'Address',
      accessorKey: 'address',
      cell: ({ getValue }) => {
        const val = getValue()
        return val
          ? <span className="text-sm whitespace-normal break-words max-w-[200px] block">{val}</span>
          : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: 'contact',
      header: 'Contact',
      enableSorting: false,
      accessorFn: (row) => {
        const primary = row.contacts?.find(c => c.is_primary === 1) ?? row.contacts?.[0]
        return primary?.phone ?? ''
      },
      cell: ({ row }) => {
        const primary = row.original.contacts?.find(c => c.is_primary === 1)
          ?? row.original.contacts?.[0]
          ?? null
        if (!primary) return <span className="text-muted-foreground">—</span>
        return (
          <div className="space-y-0.5">
            <p className="text-sm">{primary.phone}</p>
            <p className="text-xs text-muted-foreground">{primary.label}</p>
          </div>
        )
      },
    },
  ]
}

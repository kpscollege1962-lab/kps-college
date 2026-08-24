import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dateUtils'
import { Link } from 'react-router'

export function getStaffColumns({ page, limit }) {
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
      id: 'name',
      header: 'Name',
      accessorKey: 'full_name',
      cell: ({ row }) => {
        const { full_name, gender } = row.original
        const title = gender === 'male' ? 'Mr. ' : gender === 'female' ? 'Miss. ' : ''
        return (
          <Link
            to={`/portal/staff/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {title}{full_name}
          </Link>
        )
      },
    },
    {
      id: 'identifiers',
      header: 'CNIC / Emp No',
      accessorFn: (row) => [row.cnic, row.postings?.[0]?.employee_no].filter(Boolean).join(' '),
      cell: ({ row }) => {
        const { cnic } = row.original
        const employee_no = row.original.postings?.[0]?.employee_no
        if (!cnic && !employee_no) return <span className="text-muted-foreground">—</span>
        return (
          <div className="space-y-0.5 text-sm">
            {cnic && <p className="font-mono">{cnic}</p>}
            {employee_no && <p className="text-muted-foreground">{employee_no}</p>}
          </div>
        )
      },
    },
    {
      id: 'gender',
      header: 'Gender',
      accessorKey: 'gender',
      cell: ({ getValue }) => {
        const g = getValue()
        return g
          ? <Badge variant="secondary">{g === 'male' ? 'Male' : 'Female'}</Badge>
          : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: 'contact',
      header: 'Contact',
      enableSorting: false,
      accessorFn: (row) => [row.phones?.[0]?.phone, row.email].filter(Boolean).join(' '),
      cell: ({ row }) => {
        const phone = row.original.phones?.[0]?.phone
        const { email } = row.original
        if (!phone && !email) return <span className="text-sm text-muted-foreground">—</span>
        return (
          <div className="space-y-0.5 text-sm">
            {phone && <p>{phone}</p>}
            {email && <p className="text-muted-foreground">{email}</p>}
          </div>
        )
      },
    },
    {
      id: 'joining_date',
      header: 'Joined',
      accessorFn: (row) => row.postings?.[0]?.joining_date,
      cell: ({ getValue }) => {
        const val = getValue()
        return val
          ? <span className="text-sm">{formatDate(val)}</span>
          : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: 'is_active',
      header: 'Status',
      accessorFn: (row) => row.postings?.[0]?.is_active,
      cell: ({ getValue }) => {
        const active = getValue()
        return (
          <Badge
            variant={active ? 'default' : 'secondary'}
            className={active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0' : ''}
          >
            {active ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
  ]
}

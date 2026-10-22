import { useEffect } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useRoleContext } from '@/modules/auth/hooks/useRoleContext'
import { useCampusList } from '@/modules/assignments/hooks/useCampusList'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Super Admin only: the campus that Classes, Timetable, Attendance, Fees and the other
// campus pages work inside.
export default function WorkingCampusPicker({ collapsed = false }) {
  const { workingCampus, setWorkingCampus } = useRoleContext()
  const { campuses, fetchCampuses } = useCampusList()

  useEffect(() => { fetchCampuses() }, [fetchCampuses])

  useEffect(() => {
    if (!campuses.length) return
    const stillThere = workingCampus && campuses.some((c) => c.id === workingCampus.id)
    if (!stillThere) setWorkingCampus(campuses[0])
  }, [campuses, workingCampus]) 

  const name = workingCampus?.name ?? 'Select campus'

  const trigger = collapsed ? (
    <DropdownMenuTrigger
      title={`Working campus: ${name}`}
      className="flex w-full items-center justify-center rounded-lg py-2 outline-none text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
    >
      <Building2 className="w-4 h-4" />
    </DropdownMenuTrigger>
  ) : (
    <DropdownMenuTrigger className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left outline-none hover:bg-sidebar-accent">
      <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">Working campus</p>
        <p className="truncate text-sm font-medium text-sidebar-foreground leading-tight">{name}</p>
      </div>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
    </DropdownMenuTrigger>
  )

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent align="start" side={collapsed ? 'right' : 'bottom'} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Work in campus</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          {campuses.map((campus) => (
            <DropdownMenuItem key={campus.id} onClick={() => setWorkingCampus(campus)}>
              <Building2 className="w-4 h-4 mr-2 shrink-0" />
              <span className="flex-1 truncate">{campus.name}</span>
              {workingCampus?.id === campus.id && <Check className="w-3.5 h-3.5 ml-2 shrink-0 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchCampusStaffService } from '../services/classTeacherAssignments.service'

export default function StaffAssignPopover({ campusId, disabled, onSelect }) {
  const [open, setOpen]         = useState(false)
  const [inputText, setInputText] = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const debounceRef = useRef(null)

  const doSearch = async (text) => {
    setSearching(true)
    setSearchError(null)
    const result = await searchCampusStaffService(campusId, { search: text })
    if (result.success) {
      setResults(result.data.staff ?? [])
    } else {
      setSearchError(result.message || 'Failed to search staff')
      setResults([])
    }
    setSearching(false)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputText(val)
    clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(val), 400)
    } else {
      setResults([])
    }
  }

  const handleSelect = (member) => {
    onSelect(member)
    setOpen(false)
    setInputText('')
    setResults([])
  }

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) {
      setInputText('')
      setResults([])
      setSearchError(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button size="xs" variant="outline" disabled={disabled}>
            <Plus className="size-3.5 mr-1" />
            Add
          </Button>
        }
      />
      <PopoverContent align="start">
        <Input
          autoFocus
          placeholder="Search staff by name…"
          value={inputText}
          onChange={handleInputChange}
        />
        <Command shouldFilter={false}>
          <CommandList>
            {searching && (
              <div className="py-4 text-center text-sm text-muted-foreground">Searching…</div>
            )}
            {!searching && searchError && (
              <div className="py-4 text-center text-sm text-destructive">{searchError}</div>
            )}
            {!searching && !searchError && inputText.length >= 2 && (
              <>
                <CommandEmpty>No staff members found.</CommandEmpty>
                <CommandGroup>
                  {results.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={String(member.id)}
                      onSelect={() => handleSelect(member)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{member.cnic}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

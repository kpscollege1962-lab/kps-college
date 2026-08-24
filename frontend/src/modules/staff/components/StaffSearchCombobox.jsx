import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchEligibleStaffService } from '../services/staff.service'

export default function StaffSearchCombobox({ campusId, value, onChange, disabled, error }) {
  const [inputText,   setInputText]   = useState('')
  const [isOpen,      setIsOpen]      = useState(false)
  const [results,     setResults]     = useState([])
  const [searching,   setSearching]   = useState(false)
  const [searchError, setSearchError] = useState(null)

  const debounceRef = useRef(null)

  // Sync display text when controlled value changes from outside
  useEffect(() => {
    if (value) {
      setInputText(`${value.full_name} — ${value.cnic}`)
    } else {
      setInputText('')
    }
  }, [value])

  const doSearch = async (text) => {
    setSearching(true)
    setSearchError(null)
    const result = await searchEligibleStaffService(campusId, { search: text })
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
    if (value) onChange(null)
    clearTimeout(debounceRef.current)
    if (val.length >= 2) {
      setIsOpen(true)
      debounceRef.current = setTimeout(() => doSearch(val), 500)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }

  const handleFocus = () => {
    if (inputText.length >= 2) setIsOpen(true)
  }

  const handleContainerBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false)
  }

  const handleSelect = (member) => {
    onChange(member)
    setInputText(`${member.full_name} — ${member.cnic}`)
    setIsOpen(false)
    setResults([])
  }

  const handleClear = () => {
    onChange(null)
    setInputText('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative" onBlur={handleContainerBlur}>
      <div className="relative">
        <Input
          placeholder="Type name or CNIC to search…"
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pr-8"
        />
        {value && !disabled && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={handleClear}
            tabIndex={-1}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1">
          <Command shouldFilter={false}>
            <CommandList>
              {searching && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching…
                </div>
              )}
              {!searching && searchError && (
                <div className="py-6 text-center text-sm text-destructive">
                  {searchError}
                </div>
              )}
              {!searching && !searchError && (
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
                          <p className="text-sm font-medium">
                            {member.gender === 'male'
                              ? 'Mr. '
                              : member.gender === 'female'
                              ? 'Miss. '
                              : ''}
                            {member.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {member.cnic}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

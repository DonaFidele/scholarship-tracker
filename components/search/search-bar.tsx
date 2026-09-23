'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

export function SearchBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <InputGroup className="h-12 rounded-xl">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          className="h-full text-base md:text-sm"
          placeholder="Bourses pour un master en ingénierie au Canada…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Rechercher des bourses"
        />
        <InputGroupAddon align="inline-end">
          <Button
            type="submit"
            size="sm"
            className="rounded-lg"
            disabled={disabled || value.trim().length === 0}
          >
            Rechercher
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

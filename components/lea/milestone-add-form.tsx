'use client'

import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function MilestoneAddForm({
  semesterItems,
  defaultSemesterIndex,
  onAdd,
}: {
  semesterItems: { value: string; label: string }[]
  defaultSemesterIndex: number
  onAdd: (title: string, semesterLabel: string, semesterIndex: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [semester, setSemester] = useState(String(defaultSemesterIndex))
  const titleId = useId()

  if (!open) {
    return (
      <Button
        variant="outline"
        className="h-9 w-fit"
        onClick={() => setOpen(true)}
      >
        <Plus />
        Ajouter une étape
      </Button>
    )
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = title.trim()
        if (trimmed === '') return
        onAdd(trimmed, `Semestre ${semester}`, Number(semester))
        setTitle('')
        setOpen(false)
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleId}>Titre de la nouvelle étape</Label>
        <Input
          id={titleId}
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Semestre</Label>
        <Select
          items={semesterItems}
          value={semester}
          onValueChange={(v) => v && setSemester(v)}
        >
          <SelectTrigger aria-label="Semestre de la nouvelle étape" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {semesterItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-9" disabled={title.trim() === ''}>
          Ajouter
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9"
          onClick={() => {
            setTitle('')
            setOpen(false)
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

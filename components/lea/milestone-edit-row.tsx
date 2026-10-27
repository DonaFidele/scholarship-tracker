'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PlanMilestone } from '@/lib/types'

export function MilestoneEditRow({
  milestone,
  semesterItems,
  onEdit,
  onDelete,
}: {
  milestone: PlanMilestone
  semesterItems: { value: string; label: string }[]
  onEdit: (newTitle: string, semesterLabel: string, semesterIndex: number) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(milestone.title)

  const commitTitle = () => {
    const trimmed = title.trim()
    if (trimmed === '') {
      setTitle(milestone.title)
      return
    }
    if (trimmed !== milestone.title) {
      onEdit(trimmed, milestone.semester_label, milestone.semester_index)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={title}
        aria-label={`Titre de l’étape : ${milestone.title}`}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.currentTarget.blur()
          }
        }}
        className="min-w-0 flex-1"
      />
      <div className="flex items-center gap-2">
        <Select
          items={semesterItems}
          value={String(milestone.semester_index)}
          onValueChange={(value) => {
            if (!value) return
            onEdit(milestone.title, `Semestre ${value}`, Number(value))
          }}
        >
          <SelectTrigger
            aria-label={`Semestre de l’étape ${milestone.title}`}
            className="w-36"
          >
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
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Supprimer l’étape ${milestone.title}`}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

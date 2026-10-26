'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const horizonItems = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} semestre${i > 0 ? 's' : ''}`,
}))

export function LeaIntroCard({
  creatingPlan,
  onCreatePlan,
}: {
  creatingPlan: boolean
  onCreatePlan: (title: string, horizonSemesters: number) => void
}) {
  const [title, setTitle] = useState('')
  const [horizon, setHorizon] = useState('6')
  const canSubmit = title.trim().length > 0 && !creatingPlan

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Sparkles className="size-6" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Salut, je suis Léa 👋
          </h1>
          <p className="text-pretty text-muted-foreground">
            Dis-moi ton objectif, je t’aide à construire ton plan pour l’atteindre.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) onCreatePlan(title.trim(), Number(horizon))
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lea-goal">Mon objectif</Label>
            <Input
              id="lea-goal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Master en Machine Learning à Stanford"
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lea-horizon">Horizon</Label>
            <Select
              items={horizonItems}
              value={horizon}
              onValueChange={(v) => setHorizon(String(v))}
            >
              <SelectTrigger id="lea-horizon" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {horizonItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="h-10" disabled={!canSubmit}>
            {creatingPlan && <Spinner data-icon="inline-start" />}
            Créer mon plan
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ProfilePrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">Complète ton profil pour voir des bourses recommandées pour toi.</p>
        <div className="flex items-center gap-2">
          <Button nativeButton={false} render={<Link href="/profile" />}>Compléter mon profil</Button>
          <Button variant="ghost" size="icon" aria-label="Fermer" onClick={onDismiss}>
            <X />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

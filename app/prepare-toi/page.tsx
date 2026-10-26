'use client'

import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { PrepareView } from '@/components/opportunities/prepare-view'
import { MOCK_OPPORTUNITIES } from '@/lib/mock-opportunities'

export default function PrepareToiPage() {
  return (
    <div className="min-h-svh">
      <Navbar active="prepare" applicationsCount={0} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <PrepareView
          opportunities={MOCK_OPPORTUNITIES}
          onSuggest={() =>
            toast.success('Merci ! Ta suggestion sera vérifiée avant publication.')
          }
        />
      </main>
    </div>
  )
}

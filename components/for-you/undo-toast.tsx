import { Button } from '@/components/ui/button'

export function UndoToast({
  visible,
  onUndo,
}: {
  visible: boolean
  onUndo: () => void
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm md:bottom-6"
    >
      {visible && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-border bg-popover py-1.5 pr-1.5 pl-4 text-sm text-popover-foreground shadow-lg">
          <span>Masquée.</span>
          <Button variant="ghost" size="sm" onClick={onUndo}>
            Annuler
          </Button>
        </div>
      )}
    </div>
  )
}

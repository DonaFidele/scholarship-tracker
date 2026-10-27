import { Button } from '@/components/ui/button'

export function LeaQuickReplies({
  suggestions,
  disabled,
  onPick,
}: {
  suggestions: string[]
  disabled: boolean
  onPick: (text: string) => void
}) {
  if (suggestions.length === 0) return null

  return (
    <div
      role="group"
      aria-label="Suggestions de questions pour Léa"
      className="flex flex-wrap gap-2"
    >
      {suggestions.map((s) => (
        <Button
          key={s}
          variant="outline"
          size="sm"
          className="h-auto rounded-full px-3 py-1.5 text-left font-normal whitespace-normal"
          disabled={disabled}
          onClick={() => onPick(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  )
}

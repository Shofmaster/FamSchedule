import type { CalendarEvent } from '../data/mockEvents.ts'

interface FilterChipsProps {
  events: CalendarEvent[]
  activeColors: string[]
  onToggleColor: (color: string) => void
  onClear: () => void
}

export default function FilterChips({ events, activeColors, onToggleColor, onClear }: FilterChipsProps) {
  const colorCounts = new Map<string, number>()
  for (const ev of events) {
    colorCounts.set(ev.color, (colorCounts.get(ev.color) ?? 0) + 1)
  }
  const sortedColors = [...colorCounts.keys()].sort()

  if (sortedColors.length === 0) return null

  return (
    <div className="flex items-center flex-wrap gap-2">
      {sortedColors.map((color) => {
        const isActive = activeColors.includes(color)
        return (
          <button
            key={color}
            type="button"
            onClick={() => onToggleColor(color)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            ({colorCounts.get(color)})
          </button>
        )
      })}
      {activeColors.length > 0 && (
        <button type="button" onClick={onClear} className="text-xs text-orange-600 hover:text-orange-700 ml-1">
          Clear
        </button>
      )}
    </div>
  )
}

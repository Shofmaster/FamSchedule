import type { CalendarEvent } from '../data/mockEvents.ts'

interface UpcomingEventsProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

function formatUpcoming(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (date >= today && date < tomorrow) return `Today, ${time}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const weekLater = new Date(todayMidnight)
  weekLater.setDate(weekLater.getDate() + 8)

  const upcoming = events
    .filter((e) => e.start >= todayMidnight && e.start < weekLater)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Upcoming</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {upcoming.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No upcoming events</div>
        )}
        {upcoming.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => onEventClick(ev)}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors"
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
              <p className="text-xs text-gray-400">{formatUpcoming(ev.start)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

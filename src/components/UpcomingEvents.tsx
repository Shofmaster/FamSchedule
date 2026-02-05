import type { CalendarEvent } from '../data/mockEvents.ts'
import { expandRecurrence } from '../utils/expandRecurrence.ts'

interface UpcomingEventsProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

interface EventGroup {
  label: string
  events: CalendarEvent[]
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const tomorrowMidnight = new Date(todayMidnight)
  tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1)

  const dayAfterTomorrowMidnight = new Date(todayMidnight)
  dayAfterTomorrowMidnight.setDate(dayAfterTomorrowMidnight.getDate() + 2)

  const sevenDaysFromNow = new Date(todayMidnight)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const expanded = expandRecurrence(events, todayMidnight, sevenDaysFromNow)

  const today: CalendarEvent[] = []
  const tomorrow: CalendarEvent[] = []
  const later: CalendarEvent[] = []

  for (const ev of expanded) {
    if (ev.start >= todayMidnight && ev.start < tomorrowMidnight) {
      today.push(ev)
    } else if (ev.start >= tomorrowMidnight && ev.start < dayAfterTomorrowMidnight) {
      tomorrow.push(ev)
    } else if (ev.start >= dayAfterTomorrowMidnight && ev.start < sevenDaysFromNow) {
      later.push(ev)
    }
  }

  const sortByStart = (a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime()
  today.sort(sortByStart)
  tomorrow.sort(sortByStart)
  later.sort(sortByStart)

  const groups: EventGroup[] = [
    { label: 'Today', events: today },
    { label: 'Tomorrow', events: tomorrow },
    { label: 'Later', events: later },
  ].filter((g) => g.events.length > 0)

  const allEmpty = groups.length === 0

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Upcoming</h3>
      </div>
      {allEmpty ? (
        <div className="p-4 text-sm text-gray-400 text-center">No upcoming events</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {groups.map((group) => {
            const visible = group.events.slice(0, 3)
            const overflow = group.events.length - 3

            return (
              <div key={group.label}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-1">{group.label}</p>
                </div>
                {visible.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onEventClick(ev)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </button>
                ))}
                {overflow > 0 && (
                  <div className="px-4 pb-2">
                    <span className="text-xs text-orange-600">+{overflow} more</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

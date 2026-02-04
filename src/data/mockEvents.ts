export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  source: 'local' | 'google'
  allDay?: boolean
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  recurrenceCustom?: string
  importance?: 'low' | 'medium' | 'high'
  guestIds?: string[]
  description?: string
  location?: string
  googleEventId?: string
}

function weekday(dayOffset: number, hour: number, minute = 0): Date {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay())
  sunday.setHours(0, 0, 0, 0)
  const d = new Date(sunday)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

const mockEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Morning Standup', start: weekday(1, 9, 0), end: weekday(1, 9, 30), color: '#F97316', source: 'local' },
  { id: 'evt-2', title: 'Team Lunch', start: weekday(2, 12, 0), end: weekday(2, 13, 0), color: '#F97316', source: 'local' },
  { id: 'evt-3', title: 'Gym Session', start: weekday(3, 7, 0), end: weekday(3, 8, 0), color: '#F97316', source: 'local' },
  { id: 'evt-4', title: 'Book Club', start: weekday(4, 19, 0), end: weekday(4, 21, 0), color: '#FDBA74', source: 'local' },
  { id: 'evt-5', title: 'Family Dinner', start: weekday(5, 18, 30), end: weekday(5, 20, 0), color: '#FDBA74', source: 'local' },
  { id: 'evt-6', title: 'Weekend Hike', start: weekday(6, 8, 0), end: weekday(6, 12, 0), color: '#FDBA74', source: 'local' },
]

export default mockEvents

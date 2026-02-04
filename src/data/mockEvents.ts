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

const mockEvents: CalendarEvent[] = []

export default mockEvents

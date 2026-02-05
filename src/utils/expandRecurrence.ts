import type { CalendarEvent } from '../data/mockEvents'

/** Returns the [start, end) date range visible in the given calendar view. */
export function getVisibleRange(view: 'day' | 'week' | 'month', date: Date): [Date, Date] {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  if (view === 'day') {
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return [start, end]
  }

  if (view === 'week') {
    start.setDate(start.getDate() - start.getDay()) // rewind to Sunday
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return [start, end]
  }

  // month — mirrors the 42-cell grid built by getMonthGrid in CalendarGrid
  start.setDate(1)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(end.getDate() + 42)
  return [start, end]
}

/**
 * Expands recurring events into individual instances that fall within
 * [rangeStart, rangeEnd).  Non-recurring and 'custom' events pass through
 * unchanged.  Each generated instance keeps the original event's fields but
 * gets a unique id (originalId__r<n>) and shifted start/end.
 */
export function expandRecurrence(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const expanded: CalendarEvent[] = []

  for (const event of events) {
    if (!event.recurrence || event.recurrence === 'none' || event.recurrence === 'custom') {
      expanded.push(event)
      continue
    }

    const duration = event.end.getTime() - event.start.getTime()
    const origDay = event.start.getDate()
    const origMonth = event.start.getMonth()
    const origYear = event.start.getFullYear()

    for (let i = 0; i < 1000; i++) {
      const instanceStart = new Date(event.start)

      switch (event.recurrence) {
        case 'daily':
          instanceStart.setDate(origDay + i)
          break
        case 'weekly':
          instanceStart.setDate(origDay + i * 7)
          break
        case 'monthly': {
          // Set to 1st of target month first to avoid day-overflow drift
          instanceStart.setFullYear(origYear, origMonth + i, 1)
          const lastDay = new Date(instanceStart.getFullYear(), instanceStart.getMonth() + 1, 0).getDate()
          instanceStart.setDate(Math.min(origDay, lastDay))
          break
        }
        case 'yearly': {
          instanceStart.setFullYear(origYear + i, origMonth, 1)
          const lastDay = new Date(origYear + i, origMonth + 1, 0).getDate()
          instanceStart.setDate(Math.min(origDay, lastDay))
          break
        }
      }

      // Instances are chronological — once we're past the visible window we're done
      if (instanceStart.getTime() >= rangeEnd.getTime()) break

      const instanceEnd = new Date(instanceStart.getTime() + duration)

      // Not yet in the visible window — skip but keep iterating
      if (instanceEnd.getTime() <= rangeStart.getTime()) continue

      expanded.push({
        ...event,
        id: i === 0 ? event.id : `${event.id}__r${i}`,
        start: instanceStart,
        end: instanceEnd,
      })
    }
  }

  return expanded
}

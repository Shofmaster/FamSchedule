import type { CalendarEvent } from '../data/mockEvents.ts'
import type { Friend } from '../store/useAppStore.ts'

export interface AISlot {
  start: Date
  end: Date
  reason: string
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Deterministic event generator for a given friend — produces 2 events in the coming days
export function getMemberEvents(member: Friend): CalendarEvent[] {
  const now = new Date()
  const nameHash = member.name.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)

  // Event 1: 1–3 days from now, 9–12 AM
  const day1 = (nameHash % 3) + 1
  const hour1 = (nameHash % 4) + 9
  const start1 = new Date(now)
  start1.setDate(start1.getDate() + day1)
  start1.setHours(hour1, 0, 0, 0)
  const end1 = new Date(start1)
  end1.setHours(hour1 + 1, 0, 0, 0)

  // Event 2: 2–5 days from now, 2–5 PM
  const day2 = ((nameHash + 2) % 4) + 2
  const hour2 = ((nameHash + 3) % 4) + 14
  const start2 = new Date(now)
  start2.setDate(start2.getDate() + day2)
  start2.setHours(hour2, 0, 0, 0)
  const end2 = new Date(start2)
  end2.setHours(hour2 + 1, 0, 0, 0)

  return [
    { id: `member-evt-${member.id}-1`, title: 'Meeting', start: start1, end: end1, color: '#9333EA', source: 'local' },
    { id: `member-evt-${member.id}-2`, title: 'Lunch', start: start2, end: end2, color: '#9333EA', source: 'local' },
  ]
}

export function hasConflict(events: CalendarEvent[], start: Date, end: Date): boolean {
  return events.some((evt) => evt.start < end && evt.end > start)
}

// Finds the best 1-hour group slot in the next 7 days at 14:00/15:00/16:00
// excludeSlot — when re-suggesting, skip the previously returned slot
export function findBestGroupSlot(members: Friend[], userEvents: CalendarEvent[], excludeSlot?: AISlot): AISlot {
  const now = new Date()
  let bestSlot: AISlot | null = null
  let bestConflicts = Infinity

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + dayOffset)

    for (const hour of [14, 15, 16]) {
      const start = new Date(day)
      start.setHours(hour, 0, 0, 0)
      const end = new Date(start)
      end.setHours(hour + 1, 0, 0, 0)

      // Skip the previously suggested slot when re-suggesting
      if (
        excludeSlot &&
        start.getFullYear() === excludeSlot.start.getFullYear() &&
        start.getMonth() === excludeSlot.start.getMonth() &&
        start.getDate() === excludeSlot.start.getDate() &&
        start.getHours() === excludeSlot.start.getHours()
      ) {
        continue
      }

      let conflicts = 0
      const conflicting: string[] = []

      if (hasConflict(userEvents, start, end)) conflicts++

      for (const member of members) {
        if (hasConflict(getMemberEvents(member), start, end)) {
          conflicts++
          conflicting.push(member.name)
        }
      }

      if (conflicts < bestConflicts) {
        bestConflicts = conflicts
        const dayName = DAY_NAMES[start.getDay()]
        const reason =
          bestConflicts === 0
            ? `${dayName} at ${hour}:00 — all members are free`
            : `${dayName} at ${hour}:00 — fewest conflicts (${conflicting.join(', ')} busy)`
        bestSlot = { start, end, reason }
      }
    }
  }

  if (!bestSlot) {
    const fallback = new Date(now)
    fallback.setDate(fallback.getDate() + 1)
    fallback.setHours(14, 0, 0, 0)
    const fallbackEnd = new Date(fallback)
    fallbackEnd.setHours(15, 0, 0, 0)
    return { start: fallback, end: fallbackEnd, reason: 'Best available slot' }
  }

  return bestSlot
}

// Finds 3 free 1-hour slots for the user over the next 3 days, weighted by high-priority friends
export function findBestPersonalSlot(userEvents: CalendarEvent[], friendsSortedByPriority: Friend[]): AISlot[] {
  const now = new Date()
  const slots: AISlot[] = []
  const checkHours = [9, 10, 11, 14, 15, 16, 17]

  for (let dayOffset = 1; dayOffset <= 3 && slots.length < 3; dayOffset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + dayOffset)

    for (const hour of checkHours) {
      if (slots.length >= 3) break

      const start = new Date(day)
      start.setHours(hour, 0, 0, 0)
      const end = new Date(start)
      end.setHours(hour + 1, 0, 0, 0)

      if (hasConflict(userEvents, start, end)) continue

      const dayName = DAY_NAMES[start.getDay()]
      let reason: string

      if (friendsSortedByPriority.length > 0) {
        const topFriend = friendsSortedByPriority[0]
        const topFree = !hasConflict(getMemberEvents(topFriend), start, end)
        reason = topFree
          ? `${dayName} at ${hour}:00 — you're free and ${topFriend.name} (priority ${topFriend.priority}) is also available`
          : `${dayName} at ${hour}:00 — you're free (${topFriend.name} is busy)`
      } else {
        reason = `${dayName} at ${hour}:00 — you're free`
      }

      slots.push({ start, end, reason })
    }
  }

  return slots
}

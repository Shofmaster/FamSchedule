import { useState } from 'react'
import type { Friend } from '../store/useAppStore.ts'
import { getMemberEvents } from '../utils/mockAI.ts'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface MemberCalendarsViewProps {
  members: Friend[]
  onEventMoved: () => void
}

export default function MemberCalendarsView({ members, onEventMoved }: MemberCalendarsViewProps) {
  const [shiftedDays, setShiftedDays] = useState<Record<string, number>>({})

  const handleMove = (eventId: string) => {
    setShiftedDays((prev) => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }))
    onEventMoved()
  }

  return (
    <div className={`grid gap-4 ${members.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {members.map((member) => {
        const events = getMemberEvents(member).map((evt) => {
          const shift = shiftedDays[evt.id] || 0
          if (shift) {
            const start = new Date(evt.start)
            start.setDate(start.getDate() + shift)
            const end = new Date(evt.end)
            end.setDate(end.getDate() + shift)
            return { ...evt, start, end }
          }
          return evt
        })

        return (
          <div key={member.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{member.name}&apos;s Week</h4>
            <div className="space-y-1.5">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between bg-purple-50 rounded-lg px-2 py-1.5">
                  <div>
                    <span className="text-xs font-medium text-gray-900">{evt.title}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {DAY_NAMES[evt.start.getDay()]} {evt.start.getHours()}:00
                    </span>
                  </div>
                  <button onClick={() => handleMove(evt.id)} className="text-xs text-orange-500 hover:text-orange-700 font-medium">
                    Move
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

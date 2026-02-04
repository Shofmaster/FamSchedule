import { useState } from 'react'
import type { CalendarEvent } from '../data/mockEvents.ts'
import type { Friend } from '../store/useAppStore.ts'

interface EventDetailPopupProps {
  event: CalendarEvent
  friends: Friend[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function EventDetailPopup({ event, friends, onClose, onEdit, onDelete }: EventDetailPopupProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const dateStr = event.allDay
    ? event.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : `${event.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  const guestNames = (event.guestIds || [])
    .map((id) => friends.find((f) => f.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Color swatch + title */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className="w-4 h-4 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: event.color }} />
          <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
        </div>

        {/* Details */}
        <div className="px-5 pb-4 space-y-1.5">
          <p className="text-sm text-gray-600">{dateStr}</p>
          {event.location && (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Location:</span> {event.location}
            </p>
          )}
          {event.description && <p className="text-sm text-gray-500">{event.description}</p>}
          {guestNames.length > 0 && (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Guests:</span> {guestNames.join(', ')}
            </p>
          )}
        </div>

        {/* Actions / delete confirmation */}
        <div className="border-t border-gray-100 px-5 py-3">
          {confirmDelete ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Are you sure?</span>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
                <button onClick={onDelete} className="text-sm text-red-600 font-semibold hover:text-red-700 cursor-pointer">Confirm</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-4">
              <button onClick={onEdit} className="text-sm text-orange-600 font-medium hover:text-orange-700 cursor-pointer">Edit</button>
              <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-500 font-medium hover:text-red-600 cursor-pointer">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

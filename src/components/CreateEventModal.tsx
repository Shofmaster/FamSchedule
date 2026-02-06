import { useState, useMemo } from 'react'
import useAppStore from '../store/useAppStore.ts'
import type { CalendarEvent } from '../data/mockEvents.ts'
import { findBestPersonalSlot } from '../utils/mockAI.ts'

const COLORS = ['#F97316', '#FDBA74', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899']

interface CreateEventModalProps {
  initialDate: Date
  existingEvent?: CalendarEvent
  defaultTitle?: string
  defaultGuestIds?: string[]
  onClose: () => void
  onSubmit: (event: CalendarEvent, pushToGoogle: boolean) => void
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTimeInput(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function addHour(d: Date): Date {
  const out = new Date(d)
  out.setHours(out.getHours() + 1)
  return out
}

export default function CreateEventModal({ initialDate, existingEvent, defaultTitle, defaultGuestIds, onClose, onSubmit }: CreateEventModalProps) {
  const friends = useAppStore((s) => s.friends)
  const googleCalendar = useAppStore((s) => s.googleCalendar)
  const localEvents = useAppStore((s) => s.localEvents)
  const isEditing = !!existingEvent

  const [title, setTitle] = useState(existingEvent?.title ?? defaultTitle ?? '')
  const [date, setDate] = useState(existingEvent ? toDateString(existingEvent.start) : toDateString(initialDate))
  const [allDay, setAllDay] = useState(existingEvent?.allDay ?? false)
  const [startTime, setStartTime] = useState(existingEvent ? formatTimeInput(existingEvent.start) : formatTimeInput(initialDate))
  const [endTime, setEndTime] = useState(existingEvent ? formatTimeInput(existingEvent.end) : formatTimeInput(addHour(initialDate)))
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>(existingEvent?.recurrence ?? 'none')
  const [recurrenceCustom, setRecurrenceCustom] = useState(existingEvent?.recurrenceCustom ?? '')
  const [importance, setImportance] = useState<'non-negotiable' | 'highly-important' | 'important' | 'flexible' | 'soft'>(existingEvent?.importance ?? 'important')
  const [guestIds, setGuestIds] = useState<string[]>(existingEvent?.guestIds ?? defaultGuestIds ?? [])
  const [guestFilter, setGuestFilter] = useState('')
  const [description, setDescription] = useState(existingEvent?.description ?? '')
  const [location, setLocation] = useState(existingEvent?.location ?? '')
  const [color, setColor] = useState(existingEvent?.color ?? '#F97316')
  const [pushToGoogle, setPushToGoogle] = useState(!isEditing)
  const [aiDismissed, setAiDismissed] = useState(false)

  // AI suggestion for new events
  const aiSuggestion = useMemo(() => {
    if (isEditing) return null
    const events = [...localEvents, ...googleCalendar.events]
    const sorted = [...friends].sort((a, b) => a.priority - b.priority)
    const suggestions = findBestPersonalSlot(events, sorted)
    return suggestions[0] ?? null
  }, [isEditing, localEvents, googleCalendar.events, friends])

  const filteredFriends = friends.filter(
    (f) => !guestIds.includes(f.id) && f.name.toLowerCase().includes(guestFilter.toLowerCase()),
  )

  // Conflict detection — derive candidate window from current form state
  const candidateStart = allDay ? new Date(`${date}T00:00:00`) : new Date(`${date}T${startTime}:00`)
  const candidateEnd = allDay ? new Date(`${date}T23:59:59`) : new Date(`${date}T${endTime}:00`)
  const conflictingEvents = [...localEvents, ...googleCalendar.events].filter((evt) => {
    if (existingEvent && evt.id === existingEvent.id) return false
    return evt.start < candidateEnd && evt.end > candidateStart
  })

  const handleStartChange = (newStart: string) => {
    setStartTime(newStart)
    if (newStart >= endTime) {
      const [h, m] = newStart.split(':').map(Number)
      const endH = (h + 1) % 24
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  const handleUseAISuggestion = () => {
    if (!aiSuggestion) return
    setDate(toDateString(aiSuggestion.start))
    setStartTime(formatTimeInput(aiSuggestion.start))
    setEndTime(formatTimeInput(aiSuggestion.end))
    setAllDay(false)
    setAiDismissed(true)
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const start = allDay ? new Date(`${date}T00:00:00`) : new Date(`${date}T${startTime}:00`)
    const end = allDay ? new Date(`${date}T23:59:59`) : new Date(`${date}T${endTime}:00`)
    const event: CalendarEvent = {
      id: existingEvent?.id ?? `evt-${Date.now()}`,
      title: title.trim(),
      start,
      end,
      color,
      source: 'local',
      allDay,
      recurrence,
      recurrenceCustom: recurrence === 'custom' ? recurrenceCustom : undefined,
      importance,
      guestIds: guestIds.length > 0 ? guestIds : undefined,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      googleEventId: existingEvent?.googleEventId,
    }
    onSubmit(event, pushToGoogle)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* AI time suggestion — new events only */}
          {!isEditing && aiSuggestion && !aiDismissed && (
            <div className="flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs text-orange-700">{aiSuggestion.reason}</p>
              <button
                type="button"
                onClick={handleUseAISuggestion}
                className="text-xs font-semibold text-orange-600 hover:text-orange-800 whitespace-nowrap"
              >
                Use this time →
              </button>
            </div>
          )}

          {/* Date + All-day toggle */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-gray-300 accent-orange-500"
              />
              <span className="text-sm text-gray-600">All day</span>
            </label>
          </div>

          {/* Start / End time — hidden when all-day */}
          {!allDay && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          )}

          {/* Conflict warning */}
          {conflictingEvents.length > 0 && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376a12 12 0 1021.593 0M12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-orange-700">Time conflict</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Overlaps with: {conflictingEvents.map((e) => e.title).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
            {recurrence === 'custom' && (
              <input
                value={recurrenceCustom}
                onChange={(e) => setRecurrenceCustom(e.target.value)}
                placeholder="e.g. Every 2 weeks on Mon and Wed"
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            )}
          </div>

          {/* Schedule Priority — segmented control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Priority</label>
            <div className="flex flex-wrap gap-1.5">
              {([
                { value: 'non-negotiable' as const, label: 'Non-Negotiable' },
                { value: 'highly-important' as const, label: 'Highly Important' },
                { value: 'important' as const, label: 'Important' },
                { value: 'flexible' as const, label: 'Flexible' },
                { value: 'soft' as const, label: 'Soft' },
              ]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setImportance(option.value)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                    importance === option.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guests — type-ahead multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            {guestIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {guestIds.map((id) => {
                  const friend = friends.find((f) => f.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1.5 rounded-full">
                      {friend?.name}
                      <button
                        type="button"
                        onClick={() => setGuestIds((prev) => prev.filter((g) => g !== id))}
                        className="hover:text-orange-900 ml-0.5 p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
            <input
              value={guestFilter}
              onChange={(e) => setGuestFilter(e.target.value)}
              placeholder="Search guests..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {guestFilter && filteredFriends.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {filteredFriends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setGuestIds((prev) => [...prev, f.id])
                      setGuestFilter('')
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Color swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Push to Google Calendar — visible only when connected, defaults ON */}
          {googleCalendar.isConnected && (
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer select-none">
              <div
                onClick={() => setPushToGoogle((prev) => !prev)}
                className={`relative w-10 h-5 rounded-full transition-colors ${pushToGoogle ? 'bg-orange-500' : 'bg-gray-300'}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    pushToGoogle ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700">Also add to Google Calendar</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

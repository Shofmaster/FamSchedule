import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ViewToggle from '../components/ViewToggle.tsx'
import CalendarGrid from '../components/CalendarGrid.tsx'
import NotificationPanel from '../components/NotificationPanel.tsx'
import GoogleCalendarButton from '../components/GoogleCalendarButton.tsx'
import useAppStore from '../store/useAppStore.ts'
import type { CalendarEvent } from '../data/mockEvents.ts'
import mockEvents from '../data/mockEvents.ts'
import CreateEventModal from '../components/CreateEventModal.tsx'
import EventDetailPopup from '../components/EventDetailPopup.tsx'
import { getVisibleRange, expandRecurrence } from '../utils/expandRecurrence.ts'
import UpcomingEvents from '../components/UpcomingEvents.tsx'
import FilterChips from '../components/FilterChips.tsx'

export default function DashboardPage() {
  const { user } = useUser()
  const notifications = useAppStore((s) => s.notifications)
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)
  const googleCalendar = useAppStore((s) => s.googleCalendar)
  const syncGoogleEvents = useAppStore((s) => s.syncGoogleEvents)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const unreadCount = notifications.filter((n) => !n.read).length
  const localEvents = useAppStore((s) => s.localEvents)
  const addLocalEvent = useAppStore((s) => s.addLocalEvent)
  const removeLocalEvent = useAppStore((s) => s.removeLocalEvent)
  const addNotification = useAppStore((s) => s.addNotification)
  const friends = useAppStore((s) => s.friends)
  const calendarView = useAppStore((s) => s.calendarView)
  const selectedDate = useAppStore((s) => s.selectedDate)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const updateLocalEvent = useAppStore((s) => s.updateLocalEvent)
  // Dedup: if a local event was pushed to Google, hide the matching Google copy
  const pushedGoogleIds = new Set(localEvents.map((e) => e.googleEventId).filter(Boolean))
  const allEvents = [
    ...mockEvents,
    ...googleCalendar.events.filter((e) => !pushedGoogleIds.has(e.id)),
    ...localEvents,
  ]
  const [rangeStart, rangeEnd] = getVisibleRange(calendarView, selectedDate)
  const expandedEvents = expandRecurrence(allEvents, rangeStart, rangeEnd)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeColors, setActiveColors] = useState<string[]>([])
  const [sourceFilter, setSourceFilter] = useState<'all' | 'local' | 'google'>('all')
  const colorFilteredEvents = activeColors.length === 0 ? expandedEvents : expandedEvents.filter((e) => activeColors.includes(e.color))
  const sourceFilteredEvents = sourceFilter === 'all' ? colorFilteredEvents : colorFilteredEvents.filter((e) => e.source === sourceFilter)
  const filteredEvents = searchQuery
    ? sourceFilteredEvents.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sourceFilteredEvents
  const [createEventDate, setCreateEventDate] = useState<Date | null>(null)

  // On mount, check if we already have a valid Google session
  useEffect(() => {
    syncGoogleEvents()
  }, [syncGoogleEvents])

  // After OAuth redirect, detect ?google=connected and sync
  useEffect(() => {
    if (searchParams.get('google') === 'connected') {
      setSearchParams({})
      syncGoogleEvents()
    }
  }, [searchParams, setSearchParams, syncGoogleEvents])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'there'}!</h1>
        <p className="text-gray-500 mt-1">Here's your schedule for today.</p>
      </div>

      {/* Google Calendar connect */}
      <div className="mb-4">
        <GoogleCalendarButton isConnected={googleCalendar.isConnected} />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <ViewToggle />
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {(['all', 'local', ...(googleCalendar.isConnected ? ['google'] : [])] as ('all' | 'local' | 'google')[]).map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                sourceFilter === src ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-[200px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-8 pr-3 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
          />
        </div>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-white/60 rounded-lg transition-colors text-xl"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Color filter chips */}
      <div className="mb-4">
        <FilterChips
          events={expandedEvents}
          activeColors={activeColors}
          onToggleColor={(color) =>
            setActiveColors((prev) =>
              prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
            )
          }
          onClear={() => setActiveColors([])}
        />
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <CalendarGrid events={filteredEvents} onDayClick={setCreateEventDate} onEventClick={setSelectedEvent} />
        </div>
        <div className={`w-72 flex-shrink-0 ${showNotifications ? 'block' : 'hidden lg:block'}`}>
          <NotificationPanel notifications={notifications} onMarkRead={markNotificationRead} />
          <div className="mt-4">
            <UpcomingEvents events={allEvents} onEventClick={setSelectedEvent} />
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailPopup
          event={selectedEvent}
          friends={friends}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => { setEditingEvent(allEvents.find((e) => e.id === selectedEvent.id.split('__r')[0]) ?? selectedEvent); setSelectedEvent(null) }}
          onDelete={async () => {
            if (selectedEvent.googleEventId && googleCalendar.isConnected) {
              try {
                await axios.delete(`/api/google/events/${selectedEvent.googleEventId}`)
              } catch {
                addNotification({
                  id: `notif-google-err-${Date.now()}`,
                  fromName: 'Google Calendar',
                  message: `Could not delete "${selectedEvent.title}" from Google Calendar. Removed locally.`,
                  read: false,
                  createdAt: new Date(),
                })
              }
            }
            removeLocalEvent(selectedEvent.id.split('__r')[0])
            setSelectedEvent(null)
          }}
        />
      )}

      {createEventDate && (
        <CreateEventModal
          initialDate={createEventDate}
          onClose={() => setCreateEventDate(null)}
          onSubmit={async (event, pushToGoogle) => {
            if (pushToGoogle && googleCalendar.isConnected) {
              try {
                const emails = (event.guestIds || [])
                  .map((id) => friends.find((f) => f.id === id)?.email)
                  .filter(Boolean) as string[]
                const { data } = await axios.post<{ googleEventId: string }>('/api/google/events', {
                  title: event.title,
                  start: event.start.toISOString(),
                  end: event.end.toISOString(),
                  allDay: event.allDay,
                  description: event.description,
                  location: event.location,
                  guests: emails,
                })
                event.googleEventId = data.googleEventId
              } catch {
                addNotification({
                  id: `notif-google-err-${Date.now()}`,
                  fromName: 'Google Calendar',
                  message: `Could not push "${event.title}" to Google Calendar. Saved locally.`,
                  read: false,
                  createdAt: new Date(),
                })
              }
            }
            addLocalEvent(event)
            setCreateEventDate(null)
          }}
        />
      )}

      {editingEvent && (
        <CreateEventModal
          initialDate={editingEvent.start}
          existingEvent={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={async (event, pushToGoogle) => {
            if (pushToGoogle && googleCalendar.isConnected && event.googleEventId) {
              try {
                const emails = (event.guestIds || [])
                  .map((id) => friends.find((f) => f.id === id)?.email)
                  .filter(Boolean) as string[]
                await axios.put(`/api/google/events/${event.googleEventId}`, {
                  title: event.title,
                  start: event.start.toISOString(),
                  end: event.end.toISOString(),
                  allDay: event.allDay,
                  description: event.description,
                  location: event.location,
                  guests: emails,
                })
              } catch {
                addNotification({
                  id: `notif-google-err-${Date.now()}`,
                  fromName: 'Google Calendar',
                  message: `Could not update "${event.title}" on Google Calendar. Saved locally.`,
                  read: false,
                  createdAt: new Date(),
                })
              }
            }
            updateLocalEvent(event.id, event)
            setEditingEvent(null)
          }}
        />
      )}
    </div>
  )
}

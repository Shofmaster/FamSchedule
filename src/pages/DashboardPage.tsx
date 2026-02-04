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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  // Dedup: if a local event was pushed to Google, hide the matching Google copy
  const pushedGoogleIds = new Set(localEvents.map((e) => e.googleEventId).filter(Boolean))
  const allEvents = [
    ...mockEvents,
    ...googleCalendar.events.filter((e) => !pushedGoogleIds.has(e.id)),
    ...localEvents,
  ]
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
      <div className="flex items-center justify-between mb-4">
        <ViewToggle />
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

      {/* Main layout */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <CalendarGrid events={allEvents} onDayClick={setCreateEventDate} onEventClick={setSelectedEvent} />
        </div>
        <div className={`w-72 flex-shrink-0 ${showNotifications ? 'block' : 'hidden lg:block'}`}>
          <NotificationPanel notifications={notifications} onMarkRead={markNotificationRead} />
        </div>
      </div>

      {selectedEvent && (
        <EventDetailPopup
          event={selectedEvent}
          friends={friends}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {/* wired in US-009 */}}
          onDelete={() => {
            removeLocalEvent(selectedEvent.id)
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
    </div>
  )
}

import { useState } from 'react'
import type { CalendarEvent } from '../data/mockEvents.ts'
import useAppStore from '../store/useAppStore.ts'

interface CalendarGridProps {
  events: CalendarEvent[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

// ── Constants ────────────────────────────────────────────────
const HOUR_HEIGHT = 56
const START_HOUR = 6
const END_HOUR = 23
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ── Helpers ──────────────────────────────────────────────────
function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getEventTop(event: CalendarEvent): number {
  return (event.start.getHours() - START_HOUR + event.start.getMinutes() / 60) * HOUR_HEIGHT
}

function getEventHeight(event: CalendarEvent): number {
  const hours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
  return hours * HOUR_HEIGHT
}

function getWeekDays(date: Date): Date[] {
  const sun = new Date(date)
  sun.setDate(date.getDate() - date.getDay())
  sun.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun)
    d.setDate(d.getDate() + i)
    return d
  })
}

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const days: Date[] = []
  const cur = new Date(start)
  while (cur <= last || days.length % 7 !== 0) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
    if (days.length >= 42) break
  }
  return days
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Sub-views ────────────────────────────────────────────────
function DayView({ selectedDate, events, onDayClick, onEventClick }: { selectedDate: Date; events: CalendarEvent[]; onDayClick?: (date: Date) => void; onEventClick?: (event: CalendarEvent) => void }) {
  const dayEvents = events.filter((e) => isSameDay(e.start, selectedDate))

  return (
    <div className="overflow-y-auto max-h-[60vh] sm:max-h-[480px]">
      <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            onClick={() => { const d = new Date(selectedDate); d.setHours(hour, 0, 0, 0); onDayClick?.(d) }}
            className="absolute left-0 right-0 border-t border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors"
            style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
          >
            <span className="text-xs text-gray-400 pl-2 pt-0.5 block">{formatHour(hour)}</span>
          </div>
        ))}
        {dayEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={(e) => { e.stopPropagation(); onEventClick?.(ev) }}
            className="absolute left-14 right-2 rounded-lg px-2 py-1 text-sm font-semibold text-white shadow-sm overflow-hidden cursor-pointer hover:opacity-80"
            style={{ top: getEventTop(ev), height: Math.max(getEventHeight(ev), 24), backgroundColor: ev.color }}
          >
            {ev.title}
          </div>
        ))}
      </div>
    </div>
  )
}

function WeekView({ selectedDate, events, onDayClick, onEventClick }: { selectedDate: Date; events: CalendarEvent[]; onDayClick?: (date: Date) => void; onEventClick?: (event: CalendarEvent) => void }) {
  const weekDays = getWeekDays(selectedDate)
  const today = new Date()

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[60vh] sm:max-h-[480px]">
      <div className="min-w-[540px]">
        {/* Day headers */}
        <div className="grid sticky top-0 bg-white z-10 border-b border-gray-200" style={{ gridTemplateColumns: '2.5rem repeat(7, 1fr)' }}>
          <div />
          {weekDays.map((day, i) => (
            <div key={i} className={`text-center py-1.5 sm:py-2 border-l border-gray-100 ${isSameDay(day, today) ? 'bg-orange-50' : ''}`}>
              <div className="text-xs text-gray-500">{DAY_NAMES[day.getDay()]}</div>
              <div className={`text-xs sm:text-sm font-bold ${isSameDay(day, today) ? 'text-orange-500' : 'text-gray-900'}`}>{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time grid + events */}
        <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Hour rows */}
          {HOURS.map((hour, i) => (
            <div key={hour} className="absolute left-0 right-0 border-t border-gray-100 flex" style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}>
              <span className="text-xs text-gray-400 w-10 pl-1 pt-0.5 flex-shrink-0">{formatHour(hour)}</span>
              {weekDays.map((day, j) => <div key={j} onClick={() => { const d = new Date(day); d.setHours(hour, 0, 0, 0); onDayClick?.(d) }} className="flex-1 border-l border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors" />)}
            </div>
          ))}
          {/* Events */}
          {weekDays.map((day, colIdx) =>
            events
              .filter((e) => isSameDay(e.start, day))
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick?.(ev) }}
                  className="absolute rounded px-1 py-0.5 text-xs font-semibold text-white shadow-sm overflow-hidden cursor-pointer hover:opacity-80"
                  style={{
                    top: getEventTop(ev),
                    height: Math.max(getEventHeight(ev), 20),
                    left: `calc(2.5rem + ${colIdx} * (100% - 2.5rem) / 7)`,
                    width: `calc((100% - 2.5rem) / 7)`,
                    backgroundColor: ev.color,
                  }}
                >
                  {ev.title}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

function MonthView({ selectedDate, events, onDayClick, onEventClick }: { selectedDate: Date; events: CalendarEvent[]; onDayClick?: (date: Date) => void; onEventClick?: (event: CalendarEvent) => void }) {
  const grid = getMonthGrid(selectedDate)
  const currentMonth = selectedDate.getMonth()
  const today = new Date()
  const [popoverDay, setPopoverDay] = useState<Date | null>(null)

  const popEvents = popoverDay ? events.filter((e) => isSameDay(e.start, popoverDay)) : []
  const popDayLabel = popoverDay
    ? popoverDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center py-2 text-xs font-medium text-gray-500">{name}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((day, i) => {
          const inMonth = day.getMonth() === currentMonth
          const isToday = isSameDay(day, today)
          const dayEvents = events.filter((e) => isSameDay(e.start, day))
          const visible = dayEvents.slice(0, 2)
          const remaining = dayEvents.length - visible.length

          return (
            <div key={i} onClick={() => setPopoverDay(day)} className={`min-h-[52px] sm:min-h-[80px] p-1 sm:p-1.5 border-b border-r border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors ${inMonth ? 'bg-white' : 'bg-gray-50'}`}>
              <div className={`text-xs font-medium ${isToday ? 'text-orange-500 font-bold' : inMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.getDate()}
              </div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {visible.map((e) => (
                  <span
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick?.(e) }}
                    className="truncate text-[10px] sm:text-xs font-medium text-white px-1 sm:px-1.5 rounded cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: e.color }}
                  >
                    {e.title}
                  </span>
                ))}
                {remaining > 0 && (
                  <span
                    onClick={(ev) => { ev.stopPropagation(); setPopoverDay(day) }}
                    className="text-xs text-orange-600 font-medium cursor-pointer hover:text-orange-700 pl-1"
                  >
                    +{remaining} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Day-events popover */}
      {popoverDay && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopoverDay(null)} />
          <div
            className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 w-[calc(100%-2rem)] sm:w-64 max-h-80 overflow-y-auto"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">{popDayLabel}</h4>
            </div>
            <div className="divide-y divide-gray-50">
              {popEvents.length === 0 && (
                <p className="text-xs text-gray-400 p-3">No events</p>
              )}
              {popEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => { setPopoverDay(null); onEventClick?.(ev) }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-orange-50 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                  <span className="text-sm text-gray-800 truncate">{ev.title}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">
                    {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => { const d = new Date(popoverDay); d.setHours(9, 0, 0, 0); setPopoverDay(null); onDayClick?.(d) }}
                className="w-full text-left text-xs text-orange-600 font-semibold hover:text-orange-700 px-1 py-1"
              >
                + New event
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function CalendarGrid({ events, onDayClick, onEventClick }: CalendarGridProps) {
  const calendarView = useAppStore((s) => s.calendarView)
  const selectedDate = useAppStore((s) => s.selectedDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedDate)

  const navigate = (dir: number) => {
    const d = new Date(selectedDate)
    if (calendarView === 'day') d.setDate(d.getDate() + dir)
    else if (calendarView === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setSelectedDate(d)
  }

  let header = ''
  if (calendarView === 'day') header = formatDate(selectedDate)
  else if (calendarView === 'week') {
    const days = getWeekDays(selectedDate)
    header = `${formatShortDate(days[0])} – ${formatShortDate(days[6])}`
  } else {
    header = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
  }

  const today = new Date()
  const isToday = (() => {
    if (calendarView === 'day') return isSameDay(selectedDate, today)
    if (calendarView === 'week') return getWeekDays(selectedDate).some((d) => isSameDay(d, today))
    return selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()
  })()

  return (
    <div className={`bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 flex flex-col ${calendarView === 'month' ? 'overflow-visible' : 'overflow-hidden'}`}>
      {/* Nav header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-lg">◀</button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{header}</span>
          {!isToday && (
            <button onClick={() => setSelectedDate(new Date())} className="px-2 py-0.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
              Today
            </button>
          )}
        </div>
        <button onClick={() => navigate(1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-lg">▶</button>
      </div>

      {calendarView === 'day' && <DayView selectedDate={selectedDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />}
      {calendarView === 'week' && <WeekView selectedDate={selectedDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />}
      {calendarView === 'month' && <MonthView selectedDate={selectedDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />}
    </div>
  )
}

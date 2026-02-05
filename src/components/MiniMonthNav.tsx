import { useState } from 'react'
import useAppStore from '../store/useAppStore.ts'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function MiniMonthNav() {
  const selectedDate = useAppStore((s) => s.selectedDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedDate)
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())

  const today = new Date()

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // First day of the displayed month (day-of-week 0=Sun)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  // Number of days in the displayed month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Build a 6-row x 7-col grid (42 cells)
  const cells: { day: number; inMonth: boolean }[] = []
  // Days from previous month to fill the first row
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false })
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true })
  }
  // Fill remaining cells with next month's days
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ day: nextDay++, inMonth: false })
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear()

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day, selectedDate.getHours(), selectedDate.getMinutes()))
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 p-3">
      {/* Month/year header with nav arrows */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-gray-500 hover:text-gray-700 px-1">◀</button>
        <span className="text-sm font-semibold text-gray-700">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="text-gray-500 hover:text-gray-700 px-1">▶</button>
      </div>

      {/* Day-of-week abbreviation header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-xs text-gray-500 text-center">{label}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const selected = cell.inMonth && isSelected(cell.day)
          const todayCell = cell.inMonth && isToday(cell.day)

          let className = 'text-xs text-center py-0.5 rounded-full'
          if (!cell.inMonth) {
            className += ' text-gray-300'
          } else if (selected) {
            className += ' bg-orange-500 text-white font-bold'
          } else if (todayCell) {
            className += ' ring-2 ring-orange-500 ring-offset-1 text-gray-700'
          } else {
            className += ' text-gray-700 hover:bg-gray-100 cursor-pointer'
          }

          return (
            <div
              key={i}
              className={className}
              onClick={cell.inMonth ? () => handleDayClick(cell.day) : undefined}
            >
              {cell.day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

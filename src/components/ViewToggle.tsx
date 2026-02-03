import useAppStore from '../store/useAppStore.ts'

const VIEWS = ['day', 'week', 'month'] as const

export default function ViewToggle() {
  const calendarView = useAppStore((state) => state.calendarView)
  const setCalendarView = useAppStore((state) => state.setCalendarView)

  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {VIEWS.map((view) => (
        <button
          key={view}
          onClick={() => setCalendarView(view)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            calendarView === view ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )
}

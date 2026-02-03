import type { AISlot } from '../utils/mockAI.ts'

interface AISuggestionCardProps {
  suggestion: AISlot
  isResuggested: boolean
  onAccept?: () => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AISuggestionCard({ suggestion, isResuggested, onAccept }: AISuggestionCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4">
      {isResuggested && (
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">
          Re-suggested
        </span>
      )}
      <div className="text-sm font-semibold text-gray-900">
        {DAY_NAMES[suggestion.start.getDay()]}, {MONTH_NAMES[suggestion.start.getMonth()]} {suggestion.start.getDate()}
      </div>
      <div className="text-sm text-orange-600 font-medium mt-0.5">
        {suggestion.start.getHours()}:00 – {suggestion.end.getHours()}:00
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{suggestion.reason}</p>
      {onAccept && (
        <button
          onClick={onAccept}
          className="mt-3 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Accept
        </button>
      )}
    </div>
  )
}

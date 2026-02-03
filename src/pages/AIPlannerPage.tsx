import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.ts'
import type { AISlot } from '../utils/mockAI.ts'
import { findBestPersonalSlot } from '../utils/mockAI.ts'
import AISuggestionCard from '../components/AISuggestionCard.tsx'
import mockEvents from '../data/mockEvents.ts'

export default function AIPlannerPage() {
  const friends = useAppStore((s) => s.friends)
  const addLocalEvent = useAppStore((s) => s.addLocalEvent)
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AISlot[]>([])
  const navigate = useNavigate()

  // Friends sorted by priority ascending (priority 1 = highest importance)
  const sortedFriends = [...friends].sort((a, b) => a.priority - b.priority)

  const handleFindBestTime = () => {
    setLoading(true)
    setSuggestions([])
    setTimeout(() => {
      const results = findBestPersonalSlot(mockEvents, sortedFriends)
      setSuggestions(results)
      setLoading(false)
    }, 1500)
  }

  const handleAccept = (slot: AISlot) => {
    addLocalEvent({
      id: `local-${Date.now()}`,
      title: eventName,
      start: slot.start,
      end: slot.end,
      color: '#F97316',
      source: 'local',
    })
    navigate('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Planner</h1>
        <p className="text-gray-500 mt-1">Let AI find the best time for your next event.</p>
      </div>

      {/* Input row */}
      <div className="mb-4 flex gap-3 items-end">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to plan?</label>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Gym session"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          onClick={handleFindBestTime}
          disabled={!eventName.trim() || loading}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          Find Best Time
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
          <p className="text-gray-600">Analyzing your schedule...</p>
        </div>
      )}

      {/* 3 suggestion cards */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map((suggestion, i) => (
            <AISuggestionCard key={i} suggestion={suggestion} isResuggested={false} onAccept={() => handleAccept(suggestion)} />
          ))}
        </div>
      )}
    </div>
  )
}

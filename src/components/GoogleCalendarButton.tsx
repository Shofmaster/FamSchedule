import { useState } from 'react'
import axios from 'axios'

interface GoogleCalendarButtonProps {
  isConnected: boolean
}

export default function GoogleCalendarButton({ isConnected }: GoogleCalendarButtonProps) {
  const [error, setError] = useState<string | null>(null)

  if (isConnected) return null

  const handleConnect = async () => {
    setError(null)
    try {
      const { data } = await axios.get<{ url: string }>('/api/google/auth')
      window.location.href = data.url
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? (err.response.data.error as string)
          : 'Could not reach the backend. Make sure it is running on port 3001.'
      setError(message)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
      >
        Connect Google Calendar
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

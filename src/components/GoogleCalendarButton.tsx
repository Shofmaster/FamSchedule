import axios from 'axios'

interface GoogleCalendarButtonProps {
  isConnected: boolean
}

export default function GoogleCalendarButton({ isConnected }: GoogleCalendarButtonProps) {
  if (isConnected) return null

  const handleConnect = async () => {
    const { data } = await axios.get<{ url: string }>('/api/google/auth')
    window.open(data.url, '_blank')
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
    >
      Connect Google Calendar
    </button>
  )
}

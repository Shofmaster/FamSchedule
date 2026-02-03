import type { Notification } from '../store/useAppStore.ts'

interface NotificationPanelProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
}

export default function NotificationPanel({ notifications, onMarkRead }: NotificationPanelProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.read && onMarkRead(n.id)}
            className={`p-3 transition-colors ${n.read ? 'bg-white' : 'border-l-4 border-orange-500 bg-orange-50 cursor-pointer hover:bg-orange-100'}`}
          >
            <div className={`text-sm ${n.read ? 'text-gray-500' : 'font-semibold text-gray-900'}`}>
              <span className="text-orange-500 font-bold">{n.fromName}</span>{' '}
              {n.message}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No notifications</div>
        )}
      </div>
    </div>
  )
}

import type { ScheduleEvent } from '../types';

interface DailyScheduleProps {
  events: ScheduleEvent[];
}

export const DailySchedule = ({ events }: DailyScheduleProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'personal':
        return '🏠';
      case 'social':
        return '👥';
      default:
        return '📅';
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">{events.length} events</span>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No events scheduled for today</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Enjoy your free time!</p>
        </div>
      ) : (
        sortedEvents.map((event) => (
          <div
            key={event.id}
            className={`relative border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(
              event.priority
            )}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getCategoryIcon(event.category)}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  {event.aiAdjusted && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                      AI Adjusted
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                  {event.participants && event.participants.length > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {event.participants.length} {event.participants.length === 1 ? 'person' : 'people'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

import type { ScheduleEvent } from '../types';

interface WeeklyScheduleProps {
  events: ScheduleEvent[];
}

export const WeeklySchedule = ({ events }: WeeklyScheduleProps) => {
  const getDaysOfWeek = () => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + diff + i);
      days.push(date);
    }
    return days;
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysOfWeek();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Weekly Schedule</h2>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={index}
              className={`rounded-lg p-3 min-h-32 ${
                today
                  ? 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-20 border-2 border-primary-500'
                  : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className="text-center mb-2">
                <div className={`text-xs font-semibold uppercase ${
                  today ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  today ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-primary-500 bg-opacity-10 dark:bg-primary-400 dark:bg-opacity-10 text-gray-800 dark:text-gray-200 truncate"
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

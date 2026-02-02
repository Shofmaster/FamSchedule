import type { ScheduleEvent } from '../types';

interface MonthlyScheduleProps {
  events: ScheduleEvent[];
}

export const MonthlySchedule = ({ events }: MonthlyScheduleProps) => {
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth();
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{monthName}</h2>

      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={index}
              className={`aspect-square rounded-lg p-2 ${
                today
                  ? 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-20 border-2 border-primary-500'
                  : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                today ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
              }`}>
                {day.getDate()}
              </div>

              {dayEvents.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="w-1.5 h-1.5 rounded-full bg-primary-500"
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

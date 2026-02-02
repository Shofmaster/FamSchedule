import type { ScheduleEvent, Notification } from '../types';

export const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily sync with the engineering team',
    startTime: new Date(new Date().setHours(9, 0, 0)),
    endTime: new Date(new Date().setHours(9, 30, 0)),
    priority: 'high',
    participants: ['Alice', 'Bob', 'Charlie'],
    category: 'work',
    aiAdjusted: false,
  },
  {
    id: '2',
    title: 'Coffee with Sarah',
    description: 'Catch up at the local cafe',
    startTime: new Date(new Date().setHours(11, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0)),
    priority: 'medium',
    participants: ['Sarah'],
    category: 'social',
    aiAdjusted: true,
  },
  {
    id: '3',
    title: 'Lunch Break',
    description: 'Time to recharge',
    startTime: new Date(new Date().setHours(12, 30, 0)),
    endTime: new Date(new Date().setHours(13, 30, 0)),
    priority: 'medium',
    participants: [],
    category: 'personal',
    aiAdjusted: false,
  },
  {
    id: '4',
    title: 'Project Review Meeting',
    description: 'Review Q1 project deliverables',
    startTime: new Date(new Date().setHours(14, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0)),
    priority: 'high',
    participants: ['Manager', 'Team Lead', 'Product Owner'],
    category: 'work',
    aiAdjusted: false,
  },
  {
    id: '5',
    title: 'Gym Session',
    description: 'Leg day workout',
    startTime: new Date(new Date().setHours(18, 0, 0)),
    endTime: new Date(new Date().setHours(19, 0, 0)),
    priority: 'low',
    participants: [],
    category: 'personal',
    aiAdjusted: true,
  },
  {
    id: '6',
    title: 'Dinner with Family',
    description: 'Family dinner at home',
    startTime: new Date(new Date().setHours(19, 30, 0)),
    endTime: new Date(new Date().setHours(20, 30, 0)),
    priority: 'high',
    participants: ['Mom', 'Dad', 'Sister'],
    category: 'personal',
    aiAdjusted: false,
  },
];

// Add events for other days in the week
export const generateWeeklyEvents = (): ScheduleEvent[] => {
  const events = [...mockEvents];
  const today = new Date();

  for (let i = 1; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    events.push({
      id: `week-${i}-1`,
      title: 'Morning Meeting',
      startTime: new Date(date.setHours(9, 0, 0)),
      endTime: new Date(date.setHours(10, 0, 0)),
      priority: 'medium',
      category: 'work',
    });

    events.push({
      id: `week-${i}-2`,
      title: 'Lunch',
      startTime: new Date(date.setHours(12, 0, 0)),
      endTime: new Date(date.setHours(13, 0, 0)),
      priority: 'low',
      category: 'personal',
    });
  }

  return events;
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Upcoming Meeting',
    message: 'Team Standup starts in 15 minutes',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: '2',
    type: 'discussion',
    title: 'New Message from Sarah',
    message: 'Hey! Looking forward to our coffee chat tomorrow',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    read: false,
    from: 'Sarah Johnson',
  },
  {
    id: '3',
    type: 'planning',
    title: 'Schedule Optimized',
    message: 'AI moved your gym session to maximize your productivity',
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
    read: true,
  },
  {
    id: '4',
    type: 'note',
    title: 'Note from Project Review',
    message: 'Action items: Update documentation, prepare demo for next week',
    timestamp: new Date(Date.now() - 24 * 60 * 60000),
    read: true,
    from: 'Team Lead',
  },
  {
    id: '5',
    type: 'reminder',
    title: "Don't Forget!",
    message: "Mom's birthday dinner this Friday",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
    read: false,
  },
];

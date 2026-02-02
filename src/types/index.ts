export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  priority: 'high' | 'medium' | 'low';
  participants?: string[];
  category: 'work' | 'personal' | 'social' | 'other';
  aiAdjusted?: boolean;
}

export interface Notification {
  id: string;
  type: 'note' | 'discussion' | 'planning' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  from?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  priority: number;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

import { create } from 'zustand'
import axios from 'axios'
import type { CalendarEvent } from '../data/mockEvents.ts'

export interface Notification {
  id: string
  fromName: string
  message: string
  read: boolean
  createdAt: Date
}

export interface Friend {
  id: string
  name: string
  email: string
  groupType: 'family' | 'friends'
  priority: number
}

export interface Group {
  id: string
  name: string
  type: 'family' | 'friends'
  priority: number
  memberIds: string[]
}

export interface ProposalResponse {
  memberId: string
  memberName: string
  status: 'pending' | 'accepted' | 'denied'
}

export interface SyncProposal {
  id: string
  groupId: string
  title: string
  suggestedStart: Date
  suggestedEnd: Date
  responses: ProposalResponse[]
}

interface GoogleCalendarState {
  isConnected: boolean
  events: CalendarEvent[]
  lastSynced: Date | null
}

interface AppState {
  calendarView: 'day' | 'week' | 'month'
  selectedDate: Date
  notifications: Notification[]
  googleCalendar: GoogleCalendarState
  friends: Friend[]
  groups: Group[]
  setCalendarView: (view: 'day' | 'week' | 'month') => void
  setSelectedDate: (date: Date) => void
  markNotificationRead: (id: string) => void
  syncGoogleEvents: () => Promise<void>
  syncProposals: SyncProposal[]
  createSyncProposal: (proposal: SyncProposal) => void
  respondToProposal: (proposalId: string, memberId: string, status: 'accepted' | 'denied') => void
  addFriend: (friend: Friend) => void
  removeFriend: (id: string) => void
  updateFriend: (id: string, updates: Partial<Friend>) => void
  addGroup: (group: Group) => void
  removeGroup: (id: string) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  localEvents: CalendarEvent[]
  addLocalEvent: (event: CalendarEvent) => void
}

const useAppStore = create<AppState>((set) => ({
  calendarView: 'day',
  selectedDate: new Date(),
  notifications: [
    { id: '1', fromName: 'Sarah', message: 'Moved "Family Dinner" to Friday 7pm', read: false, createdAt: new Date() },
    { id: '2', fromName: 'Dad', message: 'Accepted "Weekend Hike"', read: false, createdAt: new Date(Date.now() - 3600000) },
    { id: '3', fromName: 'Mom', message: 'Added you to "Book Club"', read: true, createdAt: new Date(Date.now() - 86400000) },
  ],
  googleCalendar: { isConnected: false, events: [], lastSynced: null },
  friends: [
    { id: 'friend-sarah', name: 'Sarah Chen', email: 'sarah@example.com', groupType: 'family', priority: 1 },
    { id: 'friend-dad', name: 'Dad', email: 'dad@example.com', groupType: 'family', priority: 1 },
    { id: 'friend-jake', name: 'Jake', email: 'jake@example.com', groupType: 'friends', priority: 2 },
    { id: 'friend-mia', name: 'Mia', email: 'mia@example.com', groupType: 'friends', priority: 1 },
  ],
  groups: [
    { id: 'group-family', name: 'My Family', type: 'family', priority: 1, memberIds: ['friend-sarah', 'friend-dad'] },
    { id: 'group-college', name: 'College Friends', type: 'friends', priority: 2, memberIds: ['friend-jake', 'friend-mia'] },
  ],
  syncProposals: [],
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  syncGoogleEvents: async () => {
    try {
      const { data } = await axios.get<{
        events: Array<{ id: string; title: string; start: string; end: string; color: string }>
        connected: boolean
      }>('/api/google/events')
      if (data.connected) {
        const events: CalendarEvent[] = data.events.map((e) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start),
          end: new Date(e.end),
          color: e.color,
          source: 'google' as const,
        }))
        set({ googleCalendar: { isConnected: true, events, lastSynced: new Date() } })
      }
    } catch {
      // Not connected or backend not running — leave state as is
    }
  },
  createSyncProposal: (proposal) =>
    set((state) => ({
      syncProposals: [...state.syncProposals, proposal],
      notifications: [
        ...state.notifications,
        ...proposal.responses
          .filter((r) => r.memberId !== 'current-user')
          .map((r) => ({
            id: `notif-proposal-${proposal.id}-${r.memberId}`,
            fromName: 'You',
            message: `Proposed "${proposal.title}" to ${r.memberName}`,
            read: false,
            createdAt: new Date(),
          })),
      ],
    })),
  respondToProposal: (proposalId, memberId, status) =>
    set((state) => ({
      syncProposals: state.syncProposals.map((p) =>
        p.id === proposalId
          ? { ...p, responses: p.responses.map((r) => (r.memberId === memberId ? { ...r, status } : r)) }
          : p
      ),
    })),
  addFriend: (friend) => set((state) => ({ friends: [...state.friends, friend] })),
  removeFriend: (id) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== id),
      groups: state.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== id) })),
    })),
  updateFriend: (id, updates) =>
    set((state) => ({
      friends: state.friends.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  removeGroup: (id) => set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  localEvents: [],
  addLocalEvent: (event) => set((state) => ({ localEvents: [...state.localEvents, event] })),
}))

export default useAppStore

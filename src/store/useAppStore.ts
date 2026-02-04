import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
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
  phone?: string
  groupType: 'family' | 'friends'
  priority: number
}

export interface TextInvite {
  id: string
  recipientIds: string[]
  message: string
  sentAt: Date
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

export interface Attachment {
  id: string
  type: 'image' | 'gif' | 'file'
  url: string
  name: string
  mimeType?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: Date
  attachments?: Attachment[]
}

export interface Conversation {
  id: string
  type: 'dm' | 'group'
  name: string
  participantIds: string[]
  messages: Message[]
  unreadCount: number
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
  addNotification: (notification: Notification) => void
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
  updateLocalEvent: (id: string, updates: Partial<CalendarEvent>) => void
  removeLocalEvent: (id: string) => void
  textInvites: TextInvite[]
  addTextInvite: (invite: TextInvite, recipientNames: string[]) => void
  conversations: Conversation[]
  sendMessage: (conversationId: string, content: string, attachments?: Attachment[]) => void
  addMessage: (conversationId: string, message: Message) => void
  markConversationRead: (id: string) => void
  createConversation: (type: 'dm' | 'group', name: string, participantIds: string[]) => string
}


const useAppStore = create<AppState>()(persist((set) => ({
  calendarView: 'day',
  selectedDate: new Date(),
  notifications: [
    { id: '1', fromName: 'Sarah', message: 'Moved "Family Dinner" to Friday 7pm', read: false, createdAt: new Date() },
    { id: '2', fromName: 'Dad', message: 'Accepted "Weekend Hike"', read: false, createdAt: new Date(Date.now() - 3600000) },
    { id: '3', fromName: 'Mom', message: 'Added you to "Book Club"', read: true, createdAt: new Date(Date.now() - 86400000) },
  ],
  googleCalendar: { isConnected: false, events: [], lastSynced: null },
  friends: [
    { id: 'friend-sarah', name: 'Sarah Chen', email: 'sarah@example.com', phone: '(555) 123-4567', groupType: 'family', priority: 1 },
    { id: 'friend-dad', name: 'Dad', email: 'dad@example.com', phone: '(555) 234-5678', groupType: 'family', priority: 1 },
    { id: 'friend-jake', name: 'Jake', email: 'jake@example.com', phone: '(555) 345-6789', groupType: 'friends', priority: 2 },
    { id: 'friend-mia', name: 'Mia', email: 'mia@example.com', groupType: 'friends', priority: 1 },
  ],
  groups: [
    { id: 'group-family', name: 'My Family', type: 'family', priority: 1, memberIds: ['friend-sarah', 'friend-dad'] },
    { id: 'group-college', name: 'College Friends', type: 'friends', priority: 2, memberIds: ['friend-jake', 'friend-mia'] },
  ],
  syncProposals: [],
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
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
  updateLocalEvent: (id, updates) =>
    set((state) => ({
      localEvents: state.localEvents.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  removeLocalEvent: (id) =>
    set((state) => ({
      localEvents: state.localEvents.filter((e) => e.id !== id),
    })),
  textInvites: [],
  addTextInvite: (invite, recipientNames) =>
    set((state) => ({
      textInvites: [...state.textInvites, invite],
      notifications: [
        {
          id: `notif-invite-${invite.id}`,
          fromName: 'You',
          message: `Sent text invite to ${recipientNames.length === 1 ? recipientNames[0] : `${recipientNames.length} people`}`,
          read: false,
          createdAt: new Date(),
        },
        ...state.notifications,
      ],
    })),
  conversations: [
    {
      id: 'conv-sarah',
      type: 'dm',
      name: 'Sarah Chen',
      participantIds: ['friend-sarah'],
      unreadCount: 1,
      messages: [
        { id: 'msg-s1', senderId: 'friend-sarah', senderName: 'Sarah Chen', content: 'Hey, did you see the schedule update for this weekend?', createdAt: new Date(Date.now() - 7200000) },
        { id: 'msg-s2', senderId: 'you', senderName: 'You', content: 'Yeah just saw it. Looks like a packed Saturday!', createdAt: new Date(Date.now() - 5400000) },
        { id: 'msg-s3', senderId: 'friend-sarah', senderName: 'Sarah Chen', content: 'Want to grab dinner Saturday around 7?', createdAt: new Date(Date.now() - 1800000) },
      ],
    },
    {
      id: 'conv-dad',
      type: 'dm',
      name: 'Dad',
      participantIds: ['friend-dad'],
      unreadCount: 2,
      messages: [
        { id: 'msg-d1', senderId: 'you', senderName: 'You', content: 'Hey Dad, are we still doing the car wash this weekend?', createdAt: new Date(Date.now() - 86400000) },
        { id: 'msg-d2', senderId: 'friend-dad', senderName: 'Dad', content: "Yep! Saturday morning. Don't forget to bring towels.", createdAt: new Date(Date.now() - 3600000) },
        { id: 'msg-d3', senderId: 'friend-dad', senderName: 'Dad', content: 'Be there around 9am.', createdAt: new Date(Date.now() - 3500000) },
      ],
    },
    {
      id: 'conv-jake',
      type: 'dm',
      name: 'Jake',
      participantIds: ['friend-jake'],
      unreadCount: 0,
      messages: [
        { id: 'msg-j1', senderId: 'you', senderName: 'You', content: 'Hey Jake, are you going to the study session Thursday?', createdAt: new Date(Date.now() - 172800000) },
        { id: 'msg-j2', senderId: 'friend-jake', senderName: 'Jake', content: "For sure, I'll be there. See you at 3.", createdAt: new Date(Date.now() - 172000000) },
      ],
    },
    {
      id: 'conv-mia',
      type: 'dm',
      name: 'Mia',
      participantIds: ['friend-mia'],
      unreadCount: 0,
      messages: [
        { id: 'msg-m1', senderId: 'friend-mia', senderName: 'Mia', content: 'Did you finish the project?', createdAt: new Date(Date.now() - 259200000) },
        { id: 'msg-m2', senderId: 'you', senderName: 'You', content: 'Almost, just need to wrap up the last section.', createdAt: new Date(Date.now() - 259000000) },
      ],
    },
    {
      id: 'conv-family-group',
      type: 'group',
      name: 'My Family',
      participantIds: ['friend-sarah', 'friend-dad'],
      unreadCount: 1,
      messages: [
        { id: 'msg-fg1', senderId: 'friend-sarah', senderName: 'Sarah Chen', content: 'Who is cooking dinner tonight?', createdAt: new Date(Date.now() - 7200000) },
        { id: 'msg-fg2', senderId: 'friend-dad', senderName: 'Dad', content: 'I can handle it tonight.', createdAt: new Date(Date.now() - 5000000) },
        { id: 'msg-fg3', senderId: 'friend-sarah', senderName: 'Sarah Chen', content: 'Perfect, thanks Dad!', createdAt: new Date(Date.now() - 1200000) },
      ],
    },
    {
      id: 'conv-college-group',
      type: 'group',
      name: 'College Friends',
      participantIds: ['friend-jake', 'friend-mia'],
      unreadCount: 2,
      messages: [
        { id: 'msg-cg1', senderId: 'friend-jake', senderName: 'Jake', content: 'Anyone free this Friday night?', createdAt: new Date(Date.now() - 43200000) },
        { id: 'msg-cg2', senderId: 'friend-mia', senderName: 'Mia', content: "I'm free! Let's grab dinner somewhere.", createdAt: new Date(Date.now() - 40000000) },
        { id: 'msg-cg3', senderId: 'friend-jake', senderName: 'Jake', content: 'That new place on 5th looks good.', createdAt: new Date(Date.now() - 1800000) },
      ],
    },
  ],
  sendMessage: (conversationId, content, attachments) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, { id: `msg-${Date.now()}`, senderId: 'you', senderName: 'You', content, createdAt: new Date(), attachments }] }
          : c
      ),
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
      ),
    })),
  markConversationRead: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    })),
  createConversation: (type, name, participantIds) => {
    const id = `conv-new-${Date.now()}`
    set((state) => ({
      conversations: [...state.conversations, { id, type, name, participantIds, messages: [], unreadCount: 0 }],
    }))
    return id
  },
}), {
  name: 'famschedule-store',
  storage: createJSONStorage(() => localStorage, {
    reviver: (key: string, value: unknown) => {
      const dateKeys = ['createdAt', 'start', 'end', 'suggestedStart', 'suggestedEnd', 'sentAt', 'lastSynced']
      if (dateKeys.includes(key) && typeof value === 'string') {
        const date = new Date(value as string)
        if (!isNaN(date.getTime())) return date
      }
      return value
    },
  }),
  partialize: (state) => ({
    friends: state.friends,
    groups: state.groups,
    localEvents: state.localEvents,
    conversations: state.conversations,
    syncProposals: state.syncProposals,
    textInvites: state.textInvites,
    notifications: state.notifications,
    calendarView: state.calendarView,
  }),
}))

export default useAppStore

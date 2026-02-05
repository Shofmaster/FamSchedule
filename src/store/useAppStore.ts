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
  deleteMessage: (conversationId: string, messageId: string) => void
  markConversationRead: (id: string) => void
  createConversation: (type: 'dm' | 'group', name: string, participantIds: string[]) => string
  deleteConversation: (conversationId: string) => void
}


const useAppStore = create<AppState>()(persist((set) => ({
  calendarView: 'day',
  selectedDate: new Date(),
  notifications: [],
  googleCalendar: { isConnected: false, events: [], lastSynced: null },
  friends: [],
  groups: [],
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
  conversations: [],
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
  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c
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
  deleteConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
    })),
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

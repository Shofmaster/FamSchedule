import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import useAppStore from '../store/useAppStore.ts'
import type { Conversation, Attachment } from '../store/useAppStore.ts'
import GifPicker from '../components/GifPicker.tsx'

const AVATAR_COLORS = [
  'bg-orange-100 text-orange-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): string {
  const diffDays = Math.floor((new Date().getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getPreview(conversation: Conversation): string {
  if (conversation.messages.length === 0) return 'No messages yet'
  const last = conversation.messages[conversation.messages.length - 1]
  const prefix = last.senderId === 'you' ? 'You: ' : conversation.type === 'group' ? `${last.senderName}: ` : ''
  return `${prefix}${last.content}`
}

function getLastMessageTime(conversation: Conversation): string {
  if (conversation.messages.length === 0) return ''
  return formatTime(conversation.messages[conversation.messages.length - 1].createdAt)
}

function ConversationCard({ conversation, isActive, onClick }: { conversation: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${isActive ? 'bg-orange-50' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getAvatarColor(conversation.name)}`}>
        <span className="text-sm font-semibold">{getInitials(conversation.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {conversation.name}
          </span>
          <span className="text-xs text-gray-400 shrink-0">{getLastMessageTime(conversation)}</span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{getPreview(conversation)}</p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full shrink-0 mt-1">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  )
}

export default function MessagingPage() {
  const conversations = useAppStore((s) => s.conversations)
  const friends = useAppStore((s) => s.friends)
  const groups = useAppStore((s) => s.groups)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const deleteMessage = useAppStore((s) => s.deleteMessage)
  const markConversationRead = useAppStore((s) => s.markConversationRead)
  const createConversation = useAppStore((s) => s.createConversation)
  const deleteConversation = useAppStore((s) => s.deleteConversation)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [showNewMessage, setShowNewMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileMapRef = useRef<Map<string, File>>(new Map())

  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [showGifPicker, setShowGifPicker] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  useEffect(() => {
    if (activeId) markConversationRead(activeId)
  }, [activeId, markConversationRead])

  useEffect(() => {
    if (activeId) inputRef.current?.focus()
  }, [activeId])

  const handleSelectConversation = (id: string) => {
    setActiveId(id)
    setShowNewMessage(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Attachment[] = files.map((file) => {
      const att: Attachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: file.type.startsWith('image/') ? ('image' as const) : ('file' as const),
        url: URL.createObjectURL(file),
        name: file.name,
        mimeType: file.type,
      }
      fileMapRef.current.set(att.id, file)
      return att
    })
    setPendingAttachments((prev) => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const handleSend = async () => {
    if (!input.trim() && pendingAttachments.length === 0) return
    if (!activeId) return

    const content = input.trim()

    // Upload image/file attachments to backend; GIFs already have permanent remote URLs
    const uploaded = await Promise.all(pendingAttachments.map(async (att) => {
      if (att.type === 'gif') return att
      const file = fileMapRef.current.get(att.id)
      if (!file) return att
      try {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await axios.post<{ url: string }>('/api/attachments', formData)
        URL.revokeObjectURL(att.url)
        fileMapRef.current.delete(att.id)
        return { ...att, url: data.url }
      } catch {
        return att
      }
    }))

    setInput('')
    setPendingAttachments([])
    setShowGifPicker(false)
    sendMessage(activeId, content, uploaded.length > 0 ? uploaded : undefined)
  }

  const handleNewConversation = (type: 'dm' | 'group', referenceId: string) => {
    if (type === 'dm') {
      const existing = conversations.find((c) => c.type === 'dm' && c.participantIds.includes(referenceId))
      if (existing) { handleSelectConversation(existing.id); return }
      const friend = friends.find((f) => f.id === referenceId)
      if (friend) handleSelectConversation(createConversation('dm', friend.name, [friend.id]))
    } else {
      const group = groups.find((g) => g.id === referenceId)
      if (!group) return
      const existing = conversations.find(
        (c) => c.type === 'group' && c.participantIds.length === group.memberIds.length && group.memberIds.every((mid) => c.participantIds.includes(mid))
      )
      if (existing) { handleSelectConversation(existing.id); return }
      handleSelectConversation(createConversation('group', group.name, group.memberIds))
    }
  }

  const handleDeleteConversation = () => {
    if (!activeId || !activeConversation) return
    if (!window.confirm(`Delete the conversation with ${activeConversation.name}? This can't be undone.`)) return
    deleteConversation(activeId)
    setActiveId(null)
  }

  const sorted = [...conversations].sort((a, b) => {
    const tA = a.messages.length ? a.messages[a.messages.length - 1].createdAt.getTime() : 0
    const tB = b.messages.length ? b.messages[b.messages.length - 1].createdAt.getTime() : 0
    return tB - tA
  })
  const dmList = sorted.filter((c) => c.type === 'dm')
  const groupList = sorted.filter((c) => c.type === 'group')

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Sidebar ── */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showNewMessage ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
            </svg>
          </button>
        </div>

        {/* New-message picker */}
        {showNewMessage && (
          <div className="border-b border-gray-100 bg-orange-50 p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Start a conversation</p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-400 px-1 mb-1">People</p>
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleNewConversation('dm', friend.id)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getAvatarColor(friend.name)}`}>
                    <span className="text-xs font-semibold">{getInitials(friend.name)}</span>
                  </div>
                  <span className="text-sm text-gray-700">{friend.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{friend.groupType}</span>
                </button>
              ))}
              <p className="text-xs text-gray-400 px-1 mt-2 mb-1">Groups</p>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleNewConversation('group', group.id)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getAvatarColor(group.name)}`}>
                    <span className="text-xs font-semibold">{getInitials(group.name)}</span>
                  </div>
                  <span className="text-sm text-gray-700">{group.name}</span>
                  <span className="ml-auto text-xs text-gray-400">group</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 pt-3 pb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direct Messages</span>
          </div>
          {dmList.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} isActive={conv.id === activeId} onClick={() => handleSelectConversation(conv.id)} />
          ))}
          <div className="px-3 pt-4 pb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Groups</span>
          </div>
          {groupList.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} isActive={conv.id === activeId} onClick={() => handleSelectConversation(conv.id)} />
          ))}
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-orange-50">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(activeConversation.name)}`}>
                <span className="text-sm font-semibold">{getInitials(activeConversation.name)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{activeConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {activeConversation.type === 'group' ? `${activeConversation.participantIds.length + 1} members` : 'Direct message'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteConversation}
                className="ml-auto w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeConversation.messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              )}
              <div className="space-y-3">
                {(() => {
                  let lastDateStr = ''
                  return activeConversation.messages.map((msg, i) => {
                    const isYou = msg.senderId === 'you'
                    const dateStr = formatDate(msg.createdAt)
                    const showDivider = dateStr !== lastDateStr
                    if (showDivider) lastDateStr = dateStr
                    const showName = !isYou && activeConversation.type === 'group' && (i === 0 || activeConversation.messages[i - 1].senderId !== msg.senderId)
                    return (
                      <div key={msg.id}>
                        {showDivider && (
                          <div className="flex items-center justify-center py-2">
                            <div className="h-px bg-gray-200 flex-1" />
                            <span className="mx-3 text-xs text-gray-400">{dateStr}</span>
                            <div className="h-px bg-gray-200 flex-1" />
                          </div>
                        )}
                        {showName && <p className="text-xs text-gray-500 ml-1 mb-1">{msg.senderName}</p>}
                        <div className={`flex ${isYou ? 'justify-end' : 'justify-start'} group`}>
                          {isYou && (
                            <button
                              type="button"
                              onClick={() => deleteMessage(activeId!, msg.id)}
                              className="self-start mt-0.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center cursor-pointer"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isYou ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-white shadow-sm text-gray-900 rounded-tl-sm'}`}>
                            {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={`flex flex-wrap gap-1.5 ${msg.content ? 'mt-1.5' : ''}`}>
                                {msg.attachments.map((att) => (
                                  att.type === 'image' || att.type === 'gif' ? (
                                    <img key={att.id} src={att.url} alt={att.name} className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />
                                  ) : (
                                    <div key={att.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${isYou ? 'bg-orange-400' : 'bg-gray-100'}`}>
                                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                      </svg>
                                      <span className={`text-xs truncate max-w-[120px] ${isYou ? 'text-white' : 'text-gray-700'}`}>{att.name}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            <p className={`text-xs mt-0.5 text-right ${isYou ? 'text-orange-100' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0">
              <div className="max-w-3xl mx-auto">
                {/* Pending attachment previews */}
                {pendingAttachments.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                    {pendingAttachments.map((att) => (
                      <div key={att.id} className="relative flex-shrink-0 w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                        {att.type === 'image' || att.type === 'gif' ? (
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.5 10L9 15.5m0 0L11 18l5.5-5.5M9 15.5L6.5 13" />
                            </svg>
                            <span className="text-xs text-gray-500 truncate w-full text-center px-0.5 mt-0.5">{att.name.slice(0, 6)}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => { setPendingAttachments((prev) => prev.filter((a) => a.id !== att.id)); fileMapRef.current.delete(att.id) }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center text-xs leading-none hover:bg-black/80 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* GIF picker panel */}
                <div className="relative">
                  {showGifPicker && (
                    <GifPicker
                      onSelect={(att) => setPendingAttachments((prev) => [...prev, att])}
                      onClose={() => setShowGifPicker(false)}
                    />
                  )}
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} className="hidden" />

                <div className="flex items-center gap-2">
                  {/* Paperclip */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </button>

                  {/* GIF button */}
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${showGifPicker ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    GIF
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Message ${activeConversation.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() && pendingAttachments.length === 0}
                    className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Select a conversation</h3>
              <p className="text-sm text-gray-500 mt-1">Pick a friend or group from the left to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useUser } from '@clerk/react'
import useAppStore from '../store/useAppStore.ts'
import type { AISlot } from '../utils/mockAI.ts'
import { findBestGroupSlot } from '../utils/mockAI.ts'
import GroupSelector from './GroupSelector.tsx'
import MemberCalendarsView from './MemberCalendarsView.tsx'
import AISuggestionCard from './AISuggestionCard.tsx'
import AcceptDenyFlow from './AcceptDenyFlow.tsx'
import mockEvents from '../data/mockEvents.ts'

interface SyncWorkflowProps {
  groupFilter: 'all' | 'family'
  title: string
}

export default function SyncWorkflow({ groupFilter, title }: SyncWorkflowProps) {
  const { user } = useUser()
  const groups = useAppStore((s) => s.groups)
  const friends = useAppStore((s) => s.friends)
  const createSyncProposal = useAppStore((s) => s.createSyncProposal)

  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [suggestion, setSuggestion] = useState<AISlot | null>(null)
  const [isResuggested, setIsResuggested] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null)

  const filteredGroups = groupFilter === 'all' ? groups : groups.filter((g) => g.type === 'family')
  // Auto-select when only one group available
  const effectiveGroupId = selectedGroupId || (filteredGroups.length === 1 ? filteredGroups[0].id : '')
  const selectedGroup = groups.find((g) => g.id === effectiveGroupId)
  const members = selectedGroup ? friends.filter((f) => selectedGroup.memberIds.includes(f.id)) : []

  const handleFindBestTime = () => {
    const slot = findBestGroupSlot(members, mockEvents)
    setSuggestion(slot)
    setIsResuggested(false)
    setActiveProposalId(null)
  }

  const handleEventMoved = () => {
    if (suggestion && members.length > 0) {
      const slot = findBestGroupSlot(members, mockEvents, suggestion)
      setSuggestion(slot)
      setIsResuggested(true)
    }
  }

  const handlePropose = () => {
    if (!eventTitle.trim() || !suggestion || !selectedGroup) return

    const responses = [
      { memberId: 'current-user', memberName: user?.firstName || 'You', status: 'pending' as const },
      ...members.map((m) => ({ memberId: m.id, memberName: m.name, status: 'pending' as const })),
    ]

    const newProposal = {
      id: `proposal-${Date.now()}`,
      groupId: selectedGroup.id,
      title: eventTitle.trim(),
      suggestedStart: suggestion.start,
      suggestedEnd: suggestion.end,
      responses,
    }

    createSyncProposal(newProposal)
    setActiveProposalId(newProposal.id)
    setEventTitle('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">Find the best time for your group.</p>
      </div>

      {/* Group selector */}
      <div className="mb-4">
        <GroupSelector groups={filteredGroups} selectedGroupId={effectiveGroupId} onChange={setSelectedGroupId} />
      </div>

      {/* Member calendars */}
      {selectedGroup && members.length > 0 && (
        <div className="mb-4">
          <MemberCalendarsView members={members} onEventMoved={handleEventMoved} />
        </div>
      )}

      {/* AI button */}
      {selectedGroup && members.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleFindBestTime}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Find Best Time (AI)
          </button>
        </div>
      )}

      {/* AI suggestion card */}
      {suggestion && <div className="mb-4"><AISuggestionCard suggestion={suggestion} isResuggested={isResuggested} /></div>}

      {/* Event title input + Propose button */}
      {suggestion && !activeProposalId && (
        <div className="mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Team Hangout"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <button
            onClick={handlePropose}
            disabled={!eventTitle.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Propose to Group
          </button>
        </div>
      )}

      {/* Accept / Deny flow */}
      {activeProposalId && <AcceptDenyFlow proposalId={activeProposalId} currentUserId="current-user" />}
    </div>
  )
}

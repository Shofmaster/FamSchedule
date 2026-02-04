import { useState } from 'react'
import type { Friend, Group } from '../store/useAppStore.ts'
import useAppStore from '../store/useAppStore.ts'
import PrioritySelector from './PrioritySelector.tsx'
import SendInviteModal from './SendInviteModal.tsx'

interface GroupCardProps {
  group: Group
  members: Friend[]
}

export default function GroupCard({ group, members }: GroupCardProps) {
  const removeFriend = useAppStore((s) => s.removeFriend)
  const updateFriend = useAppStore((s) => s.updateFriend)
  const [inviteRecipients, setInviteRecipients] = useState<Friend[] | null>(null)
  const [inviteGroupName, setInviteGroupName] = useState<string | undefined>(undefined)

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{group.name}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              group.type === 'family' ? 'bg-orange-100 text-orange-700' : 'bg-orange-50 text-orange-500'
            }`}
          >
            {group.type === 'family' ? 'Family' : 'Friends'}
          </span>
        </div>
        <button
          onClick={() => {
            setInviteRecipients(members)
            setInviteGroupName(group.name)
          }}
          className="text-xs px-2 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors"
        >
          Send Invite
        </button>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm text-gray-900">{member.name}</span>
              <span className="text-xs text-gray-400 ml-2">{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              {member.phone && (
                <button
                  onClick={() => {
                    setInviteRecipients([member])
                    setInviteGroupName(undefined)
                  }}
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                  title={`Send text invite to ${member.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
              )}
              <PrioritySelector value={member.priority} onChange={(p) => updateFriend(member.id, { priority: p })} />
              <button onClick={() => removeFriend(member.id)} className="text-gray-300 hover:text-red-500 transition-colors text-lg">
                ×
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="text-sm text-gray-400 italic">No members</p>}
      </div>
      {inviteRecipients && (
        <SendInviteModal
          recipients={inviteRecipients}
          groupName={inviteGroupName}
          onClose={() => {
            setInviteRecipients(null)
            setInviteGroupName(undefined)
          }}
        />
      )}
    </div>
  )
}

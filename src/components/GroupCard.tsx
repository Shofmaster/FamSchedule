import type { Friend, Group } from '../store/useAppStore.ts'
import useAppStore from '../store/useAppStore.ts'
import PrioritySelector from './PrioritySelector.tsx'

interface GroupCardProps {
  group: Group
  members: Friend[]
}

export default function GroupCard({ group, members }: GroupCardProps) {
  const removeFriend = useAppStore((s) => s.removeFriend)
  const updateFriend = useAppStore((s) => s.updateFriend)

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">{group.name}</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            group.type === 'family' ? 'bg-orange-100 text-orange-700' : 'bg-orange-50 text-orange-500'
          }`}
        >
          {group.type === 'family' ? 'Family' : 'Friends'}
        </span>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm text-gray-900">{member.name}</span>
              <span className="text-xs text-gray-400 ml-2">{member.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <PrioritySelector value={member.priority} onChange={(p) => updateFriend(member.id, { priority: p })} />
              <button onClick={() => removeFriend(member.id)} className="text-gray-300 hover:text-red-500 transition-colors text-lg">
                ×
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="text-sm text-gray-400 italic">No members</p>}
      </div>
    </div>
  )
}

import { useState } from 'react'
import useAppStore from '../store/useAppStore.ts'
import PrioritySelector from './PrioritySelector.tsx'

interface AddPersonModalProps {
  onClose: () => void
}

export default function AddPersonModal({ onClose }: AddPersonModalProps) {
  const groups = useAppStore((s) => s.groups)
  const addFriend = useAppStore((s) => s.addFriend)
  const updateGroup = useAppStore((s) => s.updateGroup)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [groupType, setGroupType] = useState<'family' | 'friends'>('family')
  const [priority, setPriority] = useState(1)
  const [assignedGroupId, setAssignedGroupId] = useState('')

  const filteredGroups = groups.filter((g) => g.type === groupType)

  const handleSubmit = () => {
    if (!name.trim()) return
    const id = `friend-${Date.now()}`
    addFriend({ id, name: name.trim(), email: email.trim(), groupType, priority })
    if (assignedGroupId) {
      const group = groups.find((g) => g.id === assignedGroupId)
      if (group) {
        updateGroup(assignedGroupId, { memberIds: [...group.memberIds, id] })
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Person</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Chen"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={groupType}
              onChange={(e) => {
                setGroupType(e.target.value as 'family' | 'friends')
                setAssignedGroupId('')
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="family">Family</option>
              <option value="friends">Friends</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <PrioritySelector value={priority} onChange={setPriority} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Group</label>
            <select
              value={assignedGroupId}
              onChange={(e) => setAssignedGroupId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">— None —</option>
              {filteredGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

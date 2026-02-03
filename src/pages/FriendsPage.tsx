import { useState } from 'react'
import useAppStore from '../store/useAppStore.ts'
import GroupCard from '../components/GroupCard.tsx'
import AddPersonModal from '../components/AddPersonModal.tsx'
import AddGroupModal from '../components/AddGroupModal.tsx'

type FilterTab = 'all' | 'family' | 'friends'

export default function FriendsPage() {
  const groups = useAppStore((s) => s.groups)
  const friends = useAppStore((s) => s.friends)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showAddGroup, setShowAddGroup] = useState(false)

  const filteredGroups = filter === 'all' ? groups : groups.filter((g) => g.type === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Friends &amp; Family</h1>
        <p className="text-gray-500 mt-1">Manage your groups and contacts.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'family', 'friends'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === tab ? 'bg-orange-500 text-white' : 'bg-white/60 text-gray-600 hover:bg-white/90'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Group cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} members={friends.filter((f) => group.memberIds.includes(f.id))} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddPerson(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Add Person
        </button>
        <button
          onClick={() => setShowAddGroup(true)}
          className="px-4 py-2 bg-white/80 hover:bg-white text-orange-600 text-sm font-semibold rounded-lg shadow-sm border border-orange-200 transition-colors"
        >
          + Add Group
        </button>
      </div>

      {showAddPerson && <AddPersonModal onClose={() => setShowAddPerson(false)} />}
      {showAddGroup && <AddGroupModal onClose={() => setShowAddGroup(false)} />}
    </div>
  )
}

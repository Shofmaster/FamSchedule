import type { Group } from '../store/useAppStore.ts'

interface GroupSelectorProps {
  groups: Group[]
  selectedGroupId: string
  onChange: (groupId: string) => void
}

export default function GroupSelector({ groups, selectedGroupId, onChange }: GroupSelectorProps) {
  if (groups.length <= 1) return null

  return (
    <select
      value={selectedGroupId}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
    >
      <option value="">Select a group</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}

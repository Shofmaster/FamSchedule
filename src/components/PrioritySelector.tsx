interface PrioritySelectorProps {
  value: number
  onChange: (priority: number) => void
}

export default function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="text-lg transition-colors cursor-pointer"
          style={{ color: star <= value ? '#F97316' : '#D1D5DB' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

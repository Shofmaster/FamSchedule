import useAppStore from '../store/useAppStore.ts'

interface AcceptDenyFlowProps {
  proposalId: string
  currentUserId: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  accepted: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
}

export default function AcceptDenyFlow({ proposalId, currentUserId }: AcceptDenyFlowProps) {
  const proposal = useAppStore((s) => s.syncProposals.find((p) => p.id === proposalId))
  const respondToProposal = useAppStore((s) => s.respondToProposal)

  if (!proposal) return null

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Responses — &quot;{proposal.title}&quot;</h4>
      <div className="space-y-2">
        {proposal.responses.map((resp) => (
          <div key={resp.memberId} className="flex items-center justify-between">
            <span className="text-sm text-gray-900">{resp.memberName}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[resp.status]}`}>
                {resp.status.charAt(0).toUpperCase() + resp.status.slice(1)}
              </span>
              {resp.memberId === currentUserId && resp.status === 'pending' && (
                <>
                  <button
                    onClick={() => respondToProposal(proposalId, resp.memberId, 'accepted')}
                    className="text-xs text-green-600 hover:text-green-800 font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToProposal(proposalId, resp.memberId, 'denied')}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Deny
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

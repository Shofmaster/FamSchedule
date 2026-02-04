import { useState } from 'react'
import type { Friend } from '../store/useAppStore.ts'
import useAppStore from '../store/useAppStore.ts'

interface SendInviteModalProps {
  recipients: Friend[]
  groupName?: string
  onClose: () => void
}

export default function SendInviteModal({ recipients, groupName, onClose }: SendInviteModalProps) {
  const addTextInvite = useAppStore((s) => s.addTextInvite)
  const withPhone = recipients.filter((r) => r.phone)
  const withoutPhone = recipients.filter((r) => !r.phone)

  const defaultMessage = groupName
    ? `Hey! You're invited to join "${groupName}" on FamSchedule — the easiest way to keep our schedule synced up!`
    : recipients.length === 1
      ? `Hey ${recipients[0].name}! You're invited to join FamSchedule — the easiest way to keep our schedule synced up!`
      : `Hey! You're invited to join FamSchedule — the easiest way to keep our schedule synced up!`

  const [message, setMessage] = useState(defaultMessage)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSend = () => {
    if (withPhone.length === 0) return
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      addTextInvite(
        {
          id: `invite-${Date.now()}`,
          recipientIds: withPhone.map((r) => r.id),
          message,
          sentAt: new Date(),
        },
        withPhone.map((r) => r.name)
      )
    }, 1500)
  }

  if (status === 'sent') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Invites Sent!</h2>
          <p className="text-sm text-gray-500 mb-1">
            {withPhone.length === 1
              ? `Text invite sent to ${withPhone[0].name}.`
              : `Text invites sent to ${withPhone.length} people.`}
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {groupName ? `Invite "${groupName}"` : 'Send Text Invite'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {groupName
            ? `Send a text invite to all members of ${groupName}.`
            : recipients.length === 1
              ? `Send a text invite to ${recipients[0].name}.`
              : `Send a text invite to ${recipients.length} people.`}
        </p>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {withPhone.map((r) => (
              <div key={r.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-900">{r.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{r.phone}</span>
              </div>
            ))}
            {withoutPhone.map((r) => (
              <div key={r.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm text-amber-700">{r.name}</span>
                <span className="text-xs text-amber-500 ml-auto">No phone</span>
              </div>
            ))}
          </div>
          {withoutPhone.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              {withoutPhone.length === 1 ? `${withoutPhone[0].name} doesn't have` : `${withoutPhone.length} people don't have`} a
              phone number on file and won't receive this invite.
            </p>
          )}
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={status === 'sending' || withPhone.length === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              withPhone.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {status === 'sending' ? 'Sending...' : withPhone.length > 1 ? 'Send to All' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

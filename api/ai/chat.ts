import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { messages, participantName, userEvents, participantEvents } = req.body as {
    messages: { sender: string; content: string }[]
    participantName: string
    userEvents?: { title: string; start: string; end: string }[]
    participantEvents?: { title: string; start: string; end: string }[]
  }

  if (!messages || messages.length === 0) {
    res.json({ reply: '' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    return
  }

  try {
    const client = new Anthropic({ apiKey })

    const conversationText = messages
      .map((m) => `${m.sender}: ${m.content}`)
      .join('\n')

    const eventsContext = userEvents && userEvents.length > 0
      ? `\n\nThe user's upcoming calendar events:\n${userEvents.map((e) => `- ${e.title}: ${e.start} to ${e.end}`).join('\n')}`
      : ''

    const participantContext = participantEvents && participantEvents.length > 0
      ? `\n\n${participantName}'s upcoming calendar events:\n${participantEvents.map((e) => `- ${e.title}: ${e.start} to ${e.end}`).join('\n')}`
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are a helpful scheduling assistant embedded in a family/friends scheduling app called FamSchedule. You help users coordinate plans, suggest times, and make scheduling easier.

Keep responses short and conversational (1-3 sentences). Be friendly and helpful. You can see the conversation between the user and ${participantName}.${eventsContext}${participantContext}

If they're discussing scheduling, help suggest times or coordinate. If they're just chatting, offer brief helpful input only if relevant. Don't be intrusive.`,
      messages: [
        {
          role: 'user',
          content: `Here's the conversation between You and ${participantName}:\n\n${conversationText}\n\nProvide a brief, helpful assistant response.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ reply: text })
  } catch (err) {
    console.error('[AI chat] Error:', err)
    res.status(500).json({ error: 'AI request failed' })
  }
}

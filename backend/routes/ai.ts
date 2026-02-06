import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()

router.post('/detect-scheduling', async (req, res, next) => {
  try {
    const { messages, participantName } = req.body as {
      messages: { sender: string; content: string }[]
      participantName: string
    }

    if (!messages || messages.length === 0) {
      res.json({ isScheduling: false, activity: '' })
      return
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
      return
    }

    const client = new Anthropic({ apiKey })

    const conversationText = messages
      .map((m) => `${m.sender}: ${m.content}`)
      .join('\n')

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: `You detect scheduling intent in conversations. Analyze the conversation and determine if the participants are trying to schedule or plan a meeting, hangout, call, or activity together.

Respond with ONLY valid JSON (no markdown, no code fences):
{"isScheduling": true/false, "activity": "brief activity description"}

If scheduling intent is detected, set isScheduling to true and activity to a short label like "lunch", "coffee", "meeting", "movie night", "study session", etc.
If no scheduling intent, set isScheduling to false and activity to "".`,
      messages: [
        {
          role: 'user',
          content: `Conversation between You and ${participantName}:\n\n${conversationText}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[AI detect-scheduling] Raw response:', text)

    let parsed: { isScheduling: boolean; activity: string }
    try {
      parsed = JSON.parse(text)
    } catch {
      console.error('[AI detect-scheduling] Failed to parse JSON:', text)
      res.json({ isScheduling: false, activity: '' })
      return
    }

    res.json({
      isScheduling: Boolean(parsed.isScheduling),
      activity: String(parsed.activity || ''),
    })
  } catch (err) {
    console.error('[AI detect-scheduling] Error:', err)
    next(err)
  }
})

router.post('/chat', async (req, res, next) => {
  try {
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
    console.log('[AI chat] Response:', text.slice(0, 100))
    res.json({ reply: text })
  } catch (err) {
    console.error('[AI chat] Error:', err)
    next(err)
  }
})

export default router

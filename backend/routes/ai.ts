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
    const parsed = JSON.parse(text) as { isScheduling: boolean; activity: string }

    res.json({
      isScheduling: Boolean(parsed.isScheduling),
      activity: String(parsed.activity || ''),
    })
  } catch (err) {
    next(err)
  }
})

export default router

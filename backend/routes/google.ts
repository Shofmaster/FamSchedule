import { Router } from 'express'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import type { Request, Response } from 'express'
import type { OAuth2Client } from 'google-auth-library'

const router = Router()

const REDIRECT_URI = 'http://localhost:3001/api/google/callback'

// Read env vars lazily — dotenv.config() in server.ts runs after this module loads
function getClientId() { return process.env.GOOGLE_CLIENT_ID || '' }
function getClientSecret() { return process.env.GOOGLE_CLIENT_SECRET || '' }

// File-backed token store: sessionId → token bundle
// Survives backend restarts. tokens.json is in .gitignore.
type TokenBundle = { access_token: string; refresh_token: string; expiry_date: number }
const TOKENS_PATH = path.resolve(__dirname, 'tokens.json')

function loadTokens(): Record<string, TokenBundle> {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function saveTokens(): void {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokenStore), 'utf-8')
}

const tokenStore: Record<string, TokenBundle> = loadTokens()

function createOAuth2Client() {
  return new google.auth.OAuth2(getClientId(), getClientSecret(), REDIRECT_URI)
}

function credentialsConfigured(): boolean {
  const id = getClientId()
  const secret = getClientSecret()
  return id.length > 0 && !id.startsWith('your_') &&
         secret.length > 0 && !secret.startsWith('your_')
}

// GET /api/google/status — reports credential and session state
router.get('/status', (req: Request, res: Response) => {
  const configured = credentialsConfigured()
  const sessionId = req.cookies?.googleSessionId
  const connected = !!(sessionId && tokenStore[sessionId])
  res.json({ configured, connected })
})

// GET /api/google/auth — returns the Google OAuth consent URL
router.get('/auth', (_req: Request, res: Response) => {
  if (!credentialsConfigured()) {
    return res.status(500).json({ error: 'Google OAuth credentials not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local' })
  }
  const oauth2Client = createOAuth2Client()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  })
  res.json({ url })
})

// GET /api/google/callback — exchanges code, stores token, redirects back
router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query
  if (!code || typeof code !== 'string') {
    return res.redirect('http://localhost:5173/dashboard?google=error')
  }

  try {
    const oauth2Client = createOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    const sessionId = uuidv4()
    tokenStore[sessionId] = {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      expiry_date: tokens.expiry_date || 0,
    }
    saveTokens()

    res.cookie('googleSessionId', sessionId, { httpOnly: true, path: '/' })
    res.redirect('http://localhost:5173/dashboard?google=connected')
  } catch (err) {
    console.error('Google OAuth token exchange failed:', err)
    res.redirect('http://localhost:5173/dashboard?google=error')
  }
})

// Returns an authenticated OAuth2 client for the session, refreshing the token if expired.
// Returns null when no valid session exists.
async function getValidClient(req: Request): Promise<OAuth2Client | null> {
  const sessionId = req.cookies?.googleSessionId
  const bundle = sessionId ? tokenStore[sessionId] : undefined
  if (!bundle) return null

  const oauth2Client = createOAuth2Client()

  if (Date.now() >= bundle.expiry_date && bundle.refresh_token) {
    oauth2Client.setCredentials({ refresh_token: bundle.refresh_token })
    const { credentials } = await oauth2Client.refreshAccessToken()
    bundle.access_token = credentials.access_token || bundle.access_token
    if (credentials.expiry_date) bundle.expiry_date = credentials.expiry_date
    saveTokens()
  }

  oauth2Client.setCredentials({ access_token: bundle.access_token })
  return oauth2Client
}

// GET /api/google/events — fetches next 30 days of events
router.get('/events', async (req: Request, res: Response) => {
  try {
    const oauth2Client = await getValidClient(req)
    if (!oauth2Client) {
      return res.status(401).json({ connected: false })
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const now = new Date()
    const thirtyDays = new Date(now)
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDays.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = (data.items || []).map((item) => ({
      id: item.id || '',
      title: item.summary || '(No title)',
      start: item.start?.dateTime || item.start?.date || now.toISOString(),
      end: item.end?.dateTime || item.end?.date || now.toISOString(),
      color: '#0d9488',
      source: 'google',
    }))

    res.json({ events, connected: true })
  } catch (err) {
    console.error('Failed to fetch Google Calendar events:', err)
    res.status(500).json({ error: 'Failed to fetch events from Google Calendar' })
  }
})

// POST /api/google/events — pushes a new event to Google Calendar
router.post('/events', async (req: Request, res: Response) => {
  try {
    const oauth2Client = await getValidClient(req)
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Not connected to Google Calendar' })
    }

    const { title, start, end, allDay, description, location, guests } = req.body as {
      title: string
      start: string
      end: string
      allDay?: boolean
      description?: string
      location?: string
      guests?: string[]
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event: Record<string, unknown> = {
      summary: title,
      start: allDay ? { date: start.slice(0, 10) } : { dateTime: start },
      end: allDay ? { date: end.slice(0, 10) } : { dateTime: end },
    }
    if (description) event.description = description
    if (location) event.location = location
    if (guests && guests.length > 0) event.attendees = guests.map((email: string) => ({ email }))

    const { data } = await calendar.events.insert({ calendarId: 'primary', requestBody: event as any })

    res.json({ googleEventId: data.id || '' })
  } catch (err) {
    console.error('Failed to create Google Calendar event:', err)
    res.status(500).json({ error: 'Failed to create event on Google Calendar' })
  }
})

// PUT /api/google/events/:id — updates an existing event on Google Calendar
router.put('/events/:id', async (req: Request, res: Response) => {
  try {
    const oauth2Client = await getValidClient(req)
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Not connected to Google Calendar' })
    }

    const { title, start, end, allDay, description, location, guests } = req.body as {
      title: string
      start: string
      end: string
      allDay?: boolean
      description?: string
      location?: string
      guests?: string[]
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event: Record<string, unknown> = {
      summary: title,
      start: allDay ? { date: start.slice(0, 10) } : { dateTime: start },
      end: allDay ? { date: end.slice(0, 10) } : { dateTime: end },
    }
    if (description) event.description = description
    if (location) event.location = location
    if (guests && guests.length > 0) event.attendees = guests.map((email: string) => ({ email }))

    await calendar.events.update({ calendarId: 'primary', eventId: req.params.id as string, requestBody: event as any })

    res.json({ updated: true })
  } catch (err) {
    console.error('Failed to update Google Calendar event:', err)
    res.status(500).json({ error: 'Failed to update event on Google Calendar' })
  }
})

// DELETE /api/google/events/:id — removes an event from Google Calendar
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const oauth2Client = await getValidClient(req)
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Not connected to Google Calendar' })
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    await calendar.events.delete({ calendarId: 'primary', eventId: req.params.id as string })

    res.json({ deleted: true })
  } catch (err) {
    console.error('Failed to delete Google Calendar event:', err)
    res.status(500).json({ error: 'Failed to delete event from Google Calendar' })
  }
})

export default router

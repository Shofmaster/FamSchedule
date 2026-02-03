# ScheduleMe — Product Specification

## What Is This App

ScheduleMe is a scheduling + social platform. It combines calendar management with AI-powered coordination to help families and friend groups find time together. Users authenticate via Clerk, manage contacts with priority/hierarchy settings, and let a mock AI engine find optimal meeting times based on everyone's calendars.

---

## Current Project State (already done — do not redo)

- React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS v4 scaffolded
- `src/main.tsx` — standard entry point (needs ClerkProvider + BrowserRouter wrapping)
- `src/App.tsx` — currently imports non-existent components (needs full rewrite)
- `src/index.css` — contains only `@import "tailwindcss";` (needs @theme tokens added)
- `src/components/` — empty directory
- `.env.local` — created with Clerk keys and Google OAuth placeholders
- `vite.config.ts` — has Tailwind plugin (needs proxy added in Step 3)
- Installed packages: react, react-dom, tailwindcss, @tailwindcss/vite, @clerk/react, react-router-dom v7.13, zustand, axios
- `.gitignore` already ignores `*.local` and `node_modules`

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Brand | `#F97316` (orange-500) | Primary accent, buttons, active states |
| Brand Light | `#FDBA74` | Highlights, badges |
| Brand Dark | `#EA580C` | Hover states |
| Page BG (auth pages) | `#FFF7ED` (orange-50) | Subtle tint behind content |
| Text Primary | `#111827` (gray-900) | Headings, body |
| Text Secondary | `#6B7280` (gray-500) | Descriptions, muted copy |
| Card style | `bg-white/90 backdrop-blur-sm shadow-sm rounded-xl` | Frosted glass aesthetic throughout |

**Login page background:** Orange-to-white gradient (`from-orange-400 via-orange-100 to-white`) with an absolutely-positioned layer of calendar grid lines drawn via `repeating-linear-gradient` in semi-transparent orange, blurred with `filter: blur(4px)`. The sign-in card sits on top with `bg-white/85 backdrop-blur-md`.

**Tailwind v4 theme tokens** go in `src/index.css`:
```css
@theme {
  --color-brand: #F97316;
  --color-brand-light: #FDBA74;
  --color-brand-dark: #EA580C;
}
```

**TypeScript strictness:** `verbatimModuleSyntax: true` means all type-only imports MUST use `import type`. `noUnusedLocals` and `noUnusedParameters` are on — zero unused vars allowed.

---

## 7 Features (built sequentially — each verified before the next)

### 1. Login Page
- Clerk `<SignIn />` component inside a frosted glass card
- Background: orange/white gradient + blurred calendar grid pattern
- Auth guard on all other routes — redirects to `/login` if not signed in
- Signed-in users are redirected to `/dashboard`

### 2. Dashboard
- Welcome banner: "Welcome back, {firstName}!" (from Clerk `useUser()`)
- Calendar view showing today's events (mock data)
- View toggle: Day / Week / Month (pill-style buttons, orange active state)
- Left/right arrow navigation between periods
  - Day: ±1 day
  - Week: ±1 week
  - Month: ±1 month
- Notification panel (sidebar or slide-out)
  - Seeded with 3 mock notifications (2 unread)
  - Unread: orange left border + bold text
  - Bell icon with red badge showing unread count
  - Click notification → marks it read, badge decrements

### 3. Google Calendar Integration
- "Connect Google Calendar" button on dashboard (hidden once connected)
- Real OAuth flow via Express backend:
  1. Frontend hits `/api/google/auth` → gets redirect URL
  2. User consents on Google
  3. Backend `/api/google/callback` exchanges code for token, sets httpOnly cookie, redirects back to `/dashboard?google=connected`
  4. Frontend detects param → fetches events via `/api/google/events`
- Google events rendered on the calendar in a distinct color (teal)
- On page refresh, dashboard mount checks `/api/google/events` — if 200, stays connected; if 401, shows connect button again

### 4. Friends & Family
- Page at `/friends`
- Filter tabs: All | Family | Friends
- Group cards showing: name, type badge (orange = Family, lighter = Friends), priority, member list
- Each member has an inline priority selector (1–5 stars, orange filled) and a remove button
- "+ Add Person" modal: name, email, group type, priority, assign to group
- "+ Add Group" modal: name, type, priority
- Seeded mock data:
  - Friends: Sarah Chen (family, P1), Dad (family, P1), Jake (friend, P2), Mia (friend, P1)
  - Groups: "My Family" (family), "College Friends" (friends)

### 5. Group Sync
- Page at `/group-sync`
- Group selector dropdown (all groups)
- Side-by-side member calendars (compact weekly view)
- "Find Best Time (AI)" button → runs mock AI → shows suggestion card (date, time, reason)
- User types event title → "Propose to Group" → creates proposal
- Accept/Deny flow: current user can accept/deny their row; other members show "Pending" (simulated)
- Re-suggestion: "Move Event" button on member calendar events. If moved event belongs to a member in the active proposal group, AI re-runs and suggestion card updates with a "Re-suggested" banner
- Creating a proposal pushes mock notifications

### 6. Family Sync
- Page at `/family-sync`
- Identical to Group Sync but group selector is filtered to family groups only
- If only one family group exists, it auto-selects (selector hidden)
- **Implemented by reusing a shared `SyncWorkflow` component** — both pages render `<SyncWorkflow>` with a `groupFilter` prop (`"all"` vs `"family"`)

### 7. AI Individual Planner
- Page at `/ai-planner`
- Text input: "What do you want to plan?"
- "Find Best Time" button → 1.5-second simulated loading ("Analyzing your schedule...") → 3 suggestion cards
- Each suggestion: date, time, reason text that references high-priority people (e.g. "Mom (priority 1) is also free")
- "Accept" button adds the event to the local calendar → appears on Dashboard
- Mock AI avoids times when high-priority contacts are busy

---

## Mock AI Logic (`src/utils/mockAI.ts`)

Two exported functions — deterministic, no network calls:

**`findBestGroupSlot(members, allEvents)`**
- Iterates next 7 days
- Checks 14:00, 15:00, 16:00 each day
- Counts how many group members have conflicts at each slot
- Returns the slot with the fewest conflicts + a reason string

**`findBestPersonalSlot(userEvents, friendsSortedByPriority)`**
- Finds free slots in the next 3 days for the current user
- Weights against high-priority friends' busy times
- Returns 3 suggestions, each with a reason string explaining the choice

---

## Routing

| Route | Page | Auth Required |
|---|---|---|
| `/` | Redirect: `/login` if not signed in, `/dashboard` if signed in | — |
| `/login` | LoginPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/friends` | FriendsPage | Yes |
| `/group-sync` | GroupSyncPage | Yes |
| `/family-sync` | FamilySyncPage | Yes |
| `/ai-planner` | AIPlannerPage | Yes |

Auth-guarded routes wrapped in `AuthGuard` (checks `useAuth().isSignedIn`) → `AuthLayout` (shared nav + `<Outlet />`).

---

## Backend (Express — created in Step 3)

Lives in `backend/` at project root. Only purpose: Google Calendar OAuth + API proxy.

| Route | Method | Does |
|---|---|---|
| `/api/google/auth` | GET | Returns `{ url }` — the Google OAuth consent URL |
| `/api/google/callback` | GET | Exchanges `?code=` for access token, stores in memory Map, sets httpOnly cookie, redirects to frontend |
| `/api/google/events` | GET | Reads cookie → gets token → calls Google Calendar API → returns next 30 days of events |

Vite proxy forwards `/api/*` to `http://localhost:3001`.

Backend deps (installed inside `backend/`):
```
express cors cookie-parser dotenv google-auth-library googleapis uuid
typescript @types/express @types/node @types/cors @types/cookie-parser @types/uuid ts-node (dev)
```

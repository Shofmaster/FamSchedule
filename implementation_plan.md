# ScheduleMe — Implementation Plan

Read `spec.md` for full requirements. This file defines the build order, file list, and completion criteria for each step.

---

## How to Know What's Done

Each step has a **completion checklist**. A step is only done when every item on its checklist passes. Do not start the next step until the current one compiles and the checklist is met.

To verify compilation at any point:
```bash
cd "C:\Users\shelb\OneDrive\Desktop\Schedule app\FamSchedule"
npm run build
```
Zero TypeScript errors = compiles. Remember: `verbatimModuleSyntax: true` → use `import type` for type-only imports. `noUnusedLocals/Params` → no unused anything.

---

## Directories to create before writing files

These directories do not exist yet. Create them before writing any files into them:
```bash
mkdir -p src/pages src/store src/data src/utils
```
Do this once at the very start, before Step 1.

---

## React Router v7 — Layout Route Pattern

React Router v7 uses **layout routes** (routes with no `path`) to share wrapping components like auth guards and layouts. The correct pattern is:

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<AuthGuard />}>          {/* no path — layout route */}
    <Route element={<AuthLayout />}>       {/* no path — layout route */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      {/* ... other guarded routes added in later steps ... */}
    </Route>
  </Route>
</Routes>
```

`AuthGuard` and `AuthLayout` both render `<Outlet />` to pass through to the child route. Do NOT use `path="*"` for the auth guard — that only matches literally unmatched paths.

---

## Zustand Store (`src/store/useAppStore.ts`)

Grows with each step. Add only the slice needed for the current step — do not add future slices early.

---

## STEP 1 — Login Page + Auth Routing

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/index.css` | MODIFY | Add `@theme` block with brand color tokens (see spec) |
| `src/main.tsx` | REWRITE | Wrap `<App>` in `<ClerkProvider>` (publishableKey from `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`) then `<BrowserRouter>` |
| `src/App.tsx` | REWRITE | `<Routes>`: `/login` → `<LoginPage />`, then a layout route (no path) with `<AuthGuard>` as element, inside that a layout route with `<AuthLayout>` as element, inside that `/dashboard` → placeholder. See "React Router v7 — Layout Route Pattern" section above. |
| `src/pages/LoginPage.tsx` | CREATE | Full-viewport gradient bg, blurred calendar grid layer, frosted card with Clerk `<SignIn />`. If user is already signed in, redirect to `/dashboard` via `useAuth()`. |
| `src/components/AuthGuard.tsx` | CREATE | `useAuth()` → if `!isLoaded` render loading spinner → if `!isSignedIn` redirect to `/login` → else `<Outlet />` |
| `src/components/AuthLayout.tsx` | CREATE | Shared nav (just the ScheduleMe logo + sign-out button for now) + `<Outlet />`. Nav links added in later steps. |

### Completion checklist
- [ ] `npm run build` passes with zero errors
- [ ] `/` redirects to `/login` when not signed in
- [ ] Login page shows orange gradient + blurred calendar grid + frosted card with Clerk SignIn widget
- [ ] Signing in redirects to `/dashboard` (can be a placeholder "Dashboard" heading for now)
- [ ] Signing out redirects back to `/login`
- [ ] Already-signed-in users hitting `/login` are redirected to `/dashboard`

---

## STEP 2 — Dashboard Page

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/store/useAppStore.ts` | CREATE | Zustand store. Step 2 slice: `calendarView`, `selectedDate`, `notifications` (seeded with 3 mock notifications, 2 unread), and their setter/action functions |
| `src/data/mockEvents.ts` | CREATE | Array of mock calendar events for the current week. Include events at various times across multiple days so all views show content. Each event: `{ id, title, start (Date), end (Date), color, source: 'local' }` |
| `src/pages/DashboardPage.tsx` | CREATE | Layout: welcome banner with user's first name (from `useUser()`), calendar section, notification section. Shows "Connect Google Calendar" area as a placeholder for Step 3. |
| `src/components/ViewToggle.tsx` | CREATE | Three-button pill: Day / Week / Month. Reads `calendarView` from store, calls `setCalendarView` on click. Active button = orange bg. |
| `src/components/CalendarGrid.tsx` | CREATE | Renders calendar based on `calendarView` + `selectedDate`. Left/right arrow nav updates `selectedDate`. Day = 24 hourly rows + event blocks. Week = 7 columns + hourly rows + event blocks. Month = date grid, dots on days with events. Takes `events` prop (merged array). |
| `src/components/NotificationPanel.tsx` | CREATE | List of notifications. Unread = orange left border + bold. Click marks read. Props: `notifications`, `onMarkRead`. |
| `src/components/AuthLayout.tsx` | MODIFY | Add bell icon with red unread-count badge. Clicking bell toggles NotificationPanel visibility. Add "Dashboard" nav link. |
| `src/App.tsx` | MODIFY | Wire `/dashboard` route to `<DashboardPage />` |

### Completion checklist
- [ ] `npm run build` passes
- [ ] Dashboard shows "Welcome back, {FirstName}!"
- [ ] Day view renders with hourly rows and mock events as colored blocks
- [ ] Week view renders 7 columns with events
- [ ] Month view renders date grid with orange dots on event days
- [ ] Left/right arrows navigate correctly in each view
- [ ] ViewToggle switches between views
- [ ] Bell icon shows badge with "2" (2 unread notifications)
- [ ] Clicking a notification marks it read; badge decrements
- [ ] NotificationPanel shows all 3 mock notifications with correct read/unread styling

---

## STEP 3 — Google Calendar Integration

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `backend/` | RUN SHELL COMMANDS | Create dir and init: `mkdir -p backend/routes backend/middleware && cd backend && npm init -y && npm install express cors cookie-parser dotenv google-auth-library googleapis uuid && npm install -D typescript @types/express @types/node @types/cors @types/cookie-parser @types/uuid ts-node` |
| `backend/tsconfig.json` | CREATE | `{ "compilerOptions": { "target": "ES2022", "module": "commonjs", "strict": true, "esModuleInterop": true, "outDir": "./dist" } }` |
| `backend/server.ts` | CREATE | Express app. `dotenv.config({ path: '../.env.local' })`. CORS with `credentials: true` for `http://localhost:5173`. cookie-parser middleware. Mounts google router at `/api/google`. Listens on `PORT` env var or 3001. |
| `backend/routes/google.ts` | CREATE | Three routes: GET `/auth` returns `{ url }` from OAuth2Client. GET `/callback` exchanges code, stores token in `Map<sessionId, token>`, sets httpOnly cookie, redirects to `http://localhost:5173/dashboard?google=connected`. GET `/events` reads cookie, fetches 30 days of events from Google Calendar API, returns `{ events, connected: true }`. |
| `backend/middleware/errorHandler.ts` | CREATE | Express error handler — catches errors, returns `{ error: message }` as JSON with 500 status. |
| `vite.config.ts` | MODIFY | Add `server: { proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } } }` |
| `src/store/useAppStore.ts` | MODIFY | Add `googleCalendar` slice: `{ isConnected, events, lastSynced }`. Add `syncGoogleEvents()` async action that calls `GET /api/google/events` via axios and updates state. |
| `src/components/GoogleCalendarButton.tsx` | CREATE | Orange button "Connect Google Calendar". On click: calls `GET /api/google/auth`, opens returned URL in new tab (`window.open`). Hidden when `googleCalendar.isConnected` is true. |
| `src/pages/DashboardPage.tsx` | MODIFY | Show `<GoogleCalendarButton />` when not connected. On mount: try `GET /api/google/events` — if 200, call `syncGoogleEvents`. Detect `?google=connected` query param via `useSearchParams` and trigger sync. Pass merged events (mock + google) to `CalendarGrid`. |
| `src/components/CalendarGrid.tsx` | MODIFY | Google-sourced events get a teal color (`#0d9488`) to distinguish from local orange events. |

### Completion checklist
- [ ] `npm run build` (frontend) passes
- [ ] Backend starts with `cd backend && npx ts-node server.ts` and logs the port
- [ ] "Connect Google Calendar" button visible on dashboard
- [ ] Clicking it opens Google consent in a new tab
- [ ] After granting access, user is redirected back to dashboard
- [ ] Button disappears (or shows "Connected") after successful auth
- [ ] Google Calendar events appear on the calendar in teal
- [ ] Refreshing the page: if previously connected, events still load (mount-time check)

---

## STEP 4 — Friends & Family

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/store/useAppStore.ts` | MODIFY | Add `friends` and `groups` slices with seeded mock data and CRUD actions (add/remove/update for both). See spec for seed data. |
| `src/pages/FriendsPage.tsx` | CREATE | Filter tabs (All/Family/Friends). Maps filtered groups to `<GroupCard>`. "+ Add Person" and "+ Add Group" buttons open modals. |
| `src/components/GroupCard.tsx` | CREATE | Shows group name, type badge (orange = Family, peach = Friends), priority, member list. Each member row: name, `<PrioritySelector>`, remove button. |
| `src/components/PrioritySelector.tsx` | CREATE | 5 stars. Filled orange up to the priority value. Clicking a star updates priority. Props: `value`, `onChange`. |
| `src/components/AddPersonModal.tsx` | CREATE | Modal overlay + card. Fields: name, email, group type (select), priority (PrioritySelector), assign to group (select, filtered by type). Submit calls `addFriend`. |
| `src/components/AddGroupModal.tsx` | CREATE | Modal overlay + card. Fields: name, type (select), priority. Submit calls `addGroup`. |
| `src/components/AuthLayout.tsx` | MODIFY | Add "Friends" nav link to `/friends` |
| `src/App.tsx` | MODIFY | Add `/friends` route → `<FriendsPage />` |

### Completion checklist
- [ ] `npm run build` passes
- [ ] `/friends` shows two group cards: "My Family" and "College Friends" with correct members
- [ ] Filter tabs correctly filter the group list
- [ ] Add Person modal opens, form submits, new person appears in correct group
- [ ] Priority selector updates inline on click
- [ ] Remove button removes the person from the card
- [ ] Add Group modal opens, form submits, new group card appears
- [ ] Removing a person also removes them from their group's member list

---

## STEP 5 — Group Sync

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/utils/mockAI.ts` | CREATE | Exports `findBestGroupSlot` and `findBestPersonalSlot`. See spec for logic. Both are pure, synchronous, deterministic functions. |
| `src/components/SyncWorkflow.tsx` | CREATE | **Reusable component.** Props: `groupFilter: 'all' \| 'family'`, `title: string`. Contains the full workflow: group selector → member calendars → AI button → suggestion card → event title input → propose button → accept/deny flow. Handles re-suggestion on event move. |
| `src/components/GroupSelector.tsx` | CREATE | `<select>` dropdown. Reads `groups` from store, filters by `groupFilter` prop. Auto-selects if only one option. |
| `src/components/MemberCalendarsView.tsx` | CREATE | Compact weekly view for each member side by side. Shows their mock events. Each event has a "Move" button — clicking it shifts the event by +1 day (simulates a move) and triggers a callback prop `onEventMoved`. |
| `src/components/AISuggestionCard.tsx` | CREATE | Shows: suggested date, time, reason text. If `isResuggested` prop is true, shows an orange "Re-suggested" banner at top. |
| `src/components/AcceptDenyFlow.tsx` | CREATE | Props: `proposal` (SyncProposal), `currentUserId`. Renders a row per member: name, status chip (Pending/Accepted/Denied with colors), and Accept/Deny buttons only on the current user's row. |
| `src/store/useAppStore.ts` | MODIFY | Add `syncProposals` slice. `createSyncProposal` creates a proposal and pushes mock notifications for each member. `respondToProposal` updates a member's response status. |
| `src/pages/GroupSyncPage.tsx` | CREATE | Renders `<SyncWorkflow groupFilter="all" title="Group Sync" />` |
| `src/components/AuthLayout.tsx` | MODIFY | Add "Group Sync" nav link |
| `src/App.tsx` | MODIFY | Add `/group-sync` route |

### Completion checklist
- [ ] `npm run build` passes
- [ ] `/group-sync` renders with group selector
- [ ] Selecting a group shows member calendars side by side
- [ ] "Find Best Time (AI)" runs and shows a suggestion card with date/time/reason
- [ ] Typing a title and clicking "Propose" creates the proposal and shows accept/deny flow
- [ ] Accepting own row updates status to "Accepted"
- [ ] Notifications appear in the notification panel after proposing
- [ ] Clicking "Move" on a member's event re-runs AI and suggestion card updates with "Re-suggested" banner

---

## STEP 6 — Family Sync

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/pages/FamilySyncPage.tsx` | CREATE | Renders `<SyncWorkflow groupFilter="family" title="Family Sync" />` |
| `src/components/AuthLayout.tsx` | MODIFY | Add "Family Sync" nav link |
| `src/App.tsx` | MODIFY | Add `/family-sync` route |

### Completion checklist
- [ ] `npm run build` passes
- [ ] `/family-sync` renders
- [ ] Group selector only shows family groups (e.g. "My Family")
- [ ] If only one family group, it auto-selects and selector is hidden
- [ ] Full sync workflow works identically to Group Sync

---

## STEP 7 — AI Individual Planner

### Files to create/modify

| File | Action | What it does |
|---|---|---|
| `src/pages/AIPlannerPage.tsx` | CREATE | Text input for event name. "Find Best Time" button. On click: show loading state for 1.5s ("Analyzing your schedule..."), then call `findBestPersonalSlot` from mockAI, render 3 `<AISuggestionCard>`s. "Accept" on a card adds the event to the store's local events (so it appears on Dashboard calendar). |
| `src/store/useAppStore.ts` | MODIFY | Add `aiSuggestions` slice + `setAISuggestions`. Add a `localEvents` array (initially empty) + `addLocalEvent` action. "Accept" on a suggestion calls `addLocalEvent` to push the new event. |
| `src/pages/DashboardPage.tsx` | MODIFY | Merge `localEvents` from the store into the events array passed to `CalendarGrid`, alongside `mockEvents` and `googleCalendar.events`. This is what makes accepted AI suggestions appear on the dashboard calendar. |
| `src/components/AuthLayout.tsx` | MODIFY | Add "AI Planner" nav link |
| `src/App.tsx` | MODIFY | Add `/ai-planner` route |

### Completion checklist
- [ ] `npm run build` passes
- [ ] `/ai-planner` renders with text input and button
- [ ] Clicking "Find Best Time" shows a loading state for ~1.5 seconds
- [ ] 3 suggestion cards appear with distinct times and priority-aware reason text
- [ ] At least one reason references a high-priority friend by name
- [ ] Clicking "Accept" on a card adds the event; navigating to Dashboard shows it on the calendar

---

## Final File Structure

```
FamSchedule/
├── backend/
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── routes/
│   │   └── google.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── server.ts
├── src/
│   ├── components/
│   │   ├── AcceptDenyFlow.tsx
│   │   ├── AddGroupModal.tsx
│   │   ├── AddPersonModal.tsx
│   │   ├── AISuggestionCard.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── GoogleCalendarButton.tsx
│   │   ├── GroupCard.tsx
│   │   ├── GroupSelector.tsx
│   │   ├── MemberCalendarsView.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── PrioritySelector.tsx
│   │   ├── SyncWorkflow.tsx
│   │   └── ViewToggle.tsx
│   ├── data/
│   │   └── mockEvents.ts
│   ├── pages/
│   │   ├── AIPlannerPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FamilySyncPage.tsx
│   │   ├── FriendsPage.tsx
│   │   ├── GroupSyncPage.tsx
│   │   └── LoginPage.tsx
│   ├── store/
│   │   └── useAppStore.ts
│   ├── utils/
│   │   └── mockAI.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.local
├── spec.md
├── implementation_plan.md
├── package.json
├── vite.config.ts
└── ...
```

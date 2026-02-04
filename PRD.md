# Product Requirements Document — FamSchedule v1.1

| Field | Value |
|---|---|
| **Document version** | 1.0 |
| **Product** | FamSchedule |
| **Release** | v1.1 |
| **Date** | 2026-02-04 |
| **Status** | Approved |

---

## 1. Executive Summary

FamSchedule v1.1 closes the three largest gaps in the v1.0 experience: users cannot create events directly from the calendar, Google Calendar is read-only, and the messaging center is text-only. This release adds tap-to-create event creation with a full-featured form, two-way Google Calendar sync so events flow in both directions, rich messaging with image and GIF attachments, and state persistence so nothing disappears on a page reload.

---

## 2. Background & Current State

FamSchedule is an AI-powered family scheduling app. The v1.0 product ships a calendar dashboard that displays events from three sources (static demo data, Google Calendar, and locally created events), an AI-powered event planner, group coordination workflows, a friends/contacts manager, and an in-app messaging center.

**Key v1.0 gaps this release addresses:**

| Gap | Impact |
|---|---|
| No way to create an event directly on the calendar | Users must leave the calendar and use the AI Planner to add events — unintuitive for simple manual scheduling |
| Google Calendar is read-only | Events created in FamSchedule never appear on the user's actual Google Calendar; the integration feels one-sided |
| Messages are text-only | Users cannot share photos, files, or GIFs in conversations |
| All state resets on page reload | Every event, message, and contact disappears when the browser tab closes or refreshes |

---

## 3. Product Goals

| # | Goal | How v1.1 addresses it |
|---|---|---|
| G1 | Make event creation feel native to the calendar | Tap any day or time slot to open a creation form; no navigation required |
| G2 | Make Google Calendar feel like a single unified calendar | Events created in FamSchedule optionally push to Google; duplicates are filtered automatically |
| G3 | Make messaging feel like a modern chat app | Support images, files, and searchable GIFs alongside text |
| G4 | Make the app feel like a real product, not a demo | User data survives page reloads |

---

## 4. User Personas

### Primary: The Family Coordinator
A parent or adult family member who manages the household schedule. Creates events, invites family members, and wants everything visible in one place alongside their existing Google Calendar.

### Secondary: The Family Member
A teenager or spouse who receives event invites, chats with family, and occasionally creates their own events. Values speed — wants to tap and go.

---

## 5. User Stories

### 5.1 Calendar Event Creation

| ID | Story | Priority |
|---|---|---|
| US-01 | As a family coordinator, I want to tap on a day in the calendar and create an event without leaving the page, so that scheduling feels fast and intuitive. | P0 |
| US-02 | As a user, I want the event creation form to pre-fill the date and time based on exactly where I tapped, so I don't have to re-enter information I already communicated by tapping. | P0 |
| US-03 | As a user, I want to set an event as all-day and have the time fields disappear, so I can create full-day events cleanly. | P0 |
| US-04 | As a user, I want to choose a recurrence pattern (daily, weekly, monthly, yearly, or custom), so I can create recurring events like "Weekly Team Standup" once. | P1 |
| US-05 | As a family coordinator, I want to add family members as guests to an event, so everyone knows what's happening and when. | P0 |
| US-06 | As a user, I want to mark an event as low, medium, or high importance, so I can visually prioritize my schedule. | P1 |
| US-07 | As a user, I want to add a description, location, and custom color to an event, so the event carries full context. | P1 |

### 5.2 Google Calendar Sync

| ID | Story | Priority |
|---|---|---|
| US-08 | As a family coordinator, I want events I create in FamSchedule to automatically appear on my Google Calendar, so I have one source of truth. | P0 |
| US-09 | As a user, I want to be able to opt out of pushing a specific event to Google Calendar, so I can keep personal notes private. | P1 |
| US-10 | As a user, I want events that exist on both FamSchedule and Google Calendar to show up only once, so my calendar isn't cluttered with duplicates. | P0 |

### 5.3 Messaging Attachments

| ID | Story | Priority |
|---|---|---|
| US-11 | As a family member, I want to attach photos to my messages, so I can share pictures without leaving the app. | P0 |
| US-12 | As a family member, I want to search for and send GIFs in conversations, so messaging feels expressive and fun. | P1 |
| US-13 | As a user, I want to attach documents (PDF, Word, text files) to messages, so I can share files in context. | P1 |
| US-14 | As a user, I want to preview attachments before I send them and remove any I don't want, so I don't accidentally send the wrong file. | P0 |

### 5.4 State Persistence

| ID | Story | Priority |
|---|---|---|
| US-15 | As a user, I want my events, messages, contacts, and settings to still be there after I close and reopen the app, so I don't have to start over every session. | P0 |

---

## 6. Functional Requirements

### 6.1 Tap-to-Create Event (FR-01 through FR-10)

**FR-01 — Calendar click detection**
All three calendar views (Day, Week, Month) must respond to user taps/clicks.
- Month view: tapping a day cell opens the creation form with that date, start time defaulting to 9:00 AM.
- Day view: tapping a time slot opens the form with that date and the tapped hour as the start time.
- Week view: tapping a time slot within a day column opens the form with that day and hour.

**FR-02 — Creation form — title**
The title field is a required text input. The "Create Event" submit button is disabled until the title contains at least one non-whitespace character.

**FR-03 — Creation form — date and all-day toggle**
A date picker is pre-filled from the tapped day. An "All day" toggle sits on the same row. When toggled on, the start-time and end-time fields are hidden from view.

**FR-04 — Creation form — start and end time**
Two time-picker inputs displayed side by side. Start time is pre-filled from the tap position (or 9:00 AM in Month view). End time defaults to one hour after start time. If the user changes start time such that end time is now earlier or equal to start time, end time automatically advances to start + 1 hour.

**FR-05 — Creation form — recurrence**
A dropdown with options: None, Daily, Weekly, Monthly, Yearly, Custom. Selecting "Custom" reveals a text input for a free-form recurrence description (e.g. "Every 2 weeks on Mon and Wed").

**FR-06 — Creation form — importance**
A segmented control with three states: Low, Medium, High. The active state uses the app's orange accent color, matching the ViewToggle pattern. Defaults to Medium.

**FR-07 — Creation form — guests**
A text input that filters the user's friends list as they type. Matching friends appear as selectable options below the input. Selected guests render as removable chips (name + dismiss button) above the input. A single friend may not be added twice.

**FR-08 — Creation form — description and location**
A multi-line textarea (3 visible rows) for description. A single-line text input for location. Both are optional.

**FR-09 — Creation form — color**
A row of color swatches (small circles, 6–8 colors). Tapping a swatch sets the event color. The currently selected color has a visible ring or border indicator. Defaults to the app's primary orange.

**FR-10 — Creation form — submit and dismiss**
- "Create Event" button adds the event to the calendar and closes the modal.
- "Cancel" button closes the modal without creating anything.
- Tapping the backdrop (outside the modal card) closes the modal without creating anything.

### 6.2 Bilateral Google Calendar Sync (FR-11 through FR-14)

**FR-11 — Scope upgrade and re-consent**
The Google OAuth flow requests the `calendar` scope (read + write). Users who previously authenticated with the read-only scope must complete the OAuth flow again. The app must prompt re-connection gracefully.

**FR-12 — Push-to-Google toggle**
The event creation form includes an "Also add to Google Calendar" toggle. This toggle is visible only when Google Calendar is connected. It defaults to ON.

**FR-13 — Event creation on Google Calendar**
When the toggle is ON and the user submits the form, the app sends the event details (title, start, end, all-day flag, description, location, and guest emails) to Google Calendar via the API. If the Google push fails for any reason, the event is still created locally and a notification informs the user of the failure.

**FR-14 — Duplicate event filtering**
When merging events for display on the dashboard, any event fetched from Google Calendar whose ID matches the Google-assigned ID stored on a local event is filtered out. The local copy is the one shown.

### 6.3 Messaging Attachments (FR-15 through FR-20)

**FR-15 — File attachment trigger**
A paperclip icon button appears to the left of the message text input. Tapping it opens the device's native file picker, filtered to images and common document types (PDF, Word, plain text). Multiple files may be selected in a single pick action.

**FR-16 — Attachment preview**
Selected files appear as a horizontally scrollable preview strip between the toolbar and the text input. Images show as 64×64 thumbnails. Files show a generic file icon with the filename (truncated if long). Each preview has a dismiss button to remove that attachment before sending.

**FR-17 — Sending with attachments**
Tapping "Send" (or pressing Enter) transmits the message text and all pending attachments together. The preview strip and pending-attachment state clear after send.

**FR-18 — Attachment rendering in chat**
Received messages (including the user's own) render attachments below the message text. Images and GIFs display as inline thumbnails (max 200×200 px, with rounded corners). Files display as a small card with an icon and filename.

**FR-19 — GIF picker — browse**
A GIF icon button in the toolbar opens a picker panel above the input bar. On open, the panel displays trending GIFs fetched from the Giphy API in a responsive grid.

**FR-20 — GIF picker — search**
The picker panel contains a search input. Typing a query (after a 300 ms debounce) fetches matching GIFs from Giphy and replaces the grid contents. Tapping a GIF adds it to the pending attachments as a single-item preview and closes the picker.

### 6.4 State Persistence (FR-21)

**FR-21 — Data survives page reload**
The following data persists across page reloads using browser local storage: friends, groups, locally created events, conversations and their messages, sync proposals, text invites, notifications, and the selected calendar view. Google Calendar event data is excluded from persistence and is re-fetched on every dashboard load.

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | The event creation modal must open within 150 ms of a tap on any calendar view. |
| NFR-02 | The GIF picker search must show results within 2 seconds of the debounce firing under a normal mobile/desktop connection. |
| NFR-03 | Image previews in the attachment strip and in chat bubbles must render without blocking the main thread (use object URLs, not base64 data URIs). |
| NFR-04 | The Google Calendar push (POST) must not block the event creation flow. The modal closes and the local event appears immediately; the push completes asynchronously. |
| NFR-05 | All new UI components follow the existing design system: orange (#F97316) as primary accent, white rounded cards for modals, consistent input and button styling. |
| NFR-06 | The app must remain functional offline — all features that do not require an external API (event creation, messaging with local attachments, calendar browsing) must work without a network connection. |

---

## 8. Key User Flows

### Flow A — Create a recurring family dinner event

1. User opens the Dashboard and views the calendar in Month view.
2. User taps Friday.
3. Event creation modal opens. Date is pre-filled to Friday; start time defaults to 9:00 AM.
4. User types "Family Dinner" as the title.
5. User changes start time to 6:30 PM. End time auto-sets to 7:30 PM. User changes end time to 8:00 PM.
6. User sets recurrence to "Weekly."
7. User sets importance to "High."
8. User types "Mom" in the guests field, selects Mom from the dropdown, then adds Dad.
9. User types "Kitchen table" in the location field.
10. Google Calendar is connected — the "Also add to Google Calendar" toggle is ON by default. User leaves it on.
11. User taps "Create Event."
12. The event appears on every Friday in the calendar. A push to Google Calendar fires in the background.

### Flow B — Share a photo in a family group chat

1. User opens the Messages page.
2. User taps the "My Family" group conversation.
3. User taps the paperclip button in the input bar.
4. Device file picker opens, filtered to images and documents.
5. User selects a photo.
6. A 64×64 thumbnail preview appears above the input field with an "×" to remove it.
7. User types "Check this out" in the text input.
8. User taps Send.
9. The message appears in the chat thread with the text above and the image thumbnail below, inside the orange message bubble.

### Flow C — Find and send a GIF

1. User opens a direct message conversation.
2. User taps the GIF button in the toolbar.
3. A panel slides open above the input bar showing trending GIFs in a grid.
4. User types "laughing" in the search box.
5. After a short pause, the grid updates with matching GIFs.
6. User taps a GIF.
7. The GIF appears in the attachment preview strip and the picker panel closes.
8. User taps Send.
9. The GIF appears in the chat thread inside the message bubble.

---

## 9. Acceptance Criteria

| Story | Acceptance Criteria |
|---|---|
| US-01 | Tapping any day in Month view opens the creation modal. Tapping any time slot in Day or Week view opens the creation modal. |
| US-02 | The date field matches the tapped day. In Day/Week view, the start time matches the tapped hour. |
| US-03 | Toggling "All day" on hides start/end time fields. Toggling it off restores them. |
| US-04 | All five preset recurrence options and the custom free-text option are available and persist on the created event. |
| US-05 | Guests can be searched, added as chips, and removed. Added guests are stored on the event. |
| US-06 | Low, Medium, and High importance states are selectable. The selected state is visually distinct. |
| US-07 | Description, location, and color are all optional fields that persist on the created event and are reflected in the calendar display (color). |
| US-08 | An event created with "Also add to Google Calendar" ON appears on the user's Google Calendar within a few seconds. |
| US-09 | An event created with the toggle OFF does not appear on Google Calendar. |
| US-10 | After creating an event that was pushed to Google and then syncing, the event appears exactly once on the dashboard. |
| US-11 | An image selected via the file picker renders as a thumbnail in the sent message. |
| US-12 | A GIF searched and selected via the picker renders in the sent message. |
| US-13 | A document selected via the file picker renders as a file card in the sent message. |
| US-14 | Each pending attachment in the preview strip can be individually removed before sending. |
| US-15 | Locally created events, messages, friends, and groups are present after a full page reload. |

---

## 10. Out of Scope (v1.1)

The following items have been discussed and deliberately deferred to future releases.

| Item | Rationale |
|---|---|
| **Edit or delete an existing event** | Create is the highest-value action; edit/delete adds complexity and can follow in v1.2 |
| **Update or delete events on Google Calendar** | Requires additional backend endpoints and conflict-resolution logic; create-only sync delivers the core bilateral value |
| **Real-time Google Calendar sync (push notifications)** | Polling on dashboard load is sufficient for a family scheduling tool at this scale |
| **Google Calendar browser extension / plugin** | Requires a separate Chrome/Firefox extension package, its own auth flow, and its own distribution channel — a standalone project |
| **iMessage integration** | Requires Apple's platform APIs and App Store distribution; out of scope for a web app |
| **Attachment cloud storage / upload** | Image and file attachments are session-scoped (object URLs). A storage backend (e.g. S3, Cloudinary) is the production path but is not needed to ship the feature |
| **Full custom recurrence builder** | A RRULE-style picker (Google Calendar's version spans multiple screens). A free-text custom field ships instead; a full builder is a future enhancement |
| **Persistent token storage** | Google OAuth tokens are held in server memory and lost on restart. A database-backed token store is the production fix; noted as future work |

---

## 11. Dependencies & Risks

| # | Dependency / Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| D1 | **Giphy API key** — GIF picker requires a free-tier API key from developer.giphy.com | — | Blocks GIF feature | Obtain key and add to `.env.local` before implementation begins |
| D2 | **Google OAuth re-consent** — upgrading from `calendar.readonly` to `calendar` requires every previously-connected user to re-authorize | High | Medium — temporary friction | The "Connect Google Calendar" button reappears naturally; no special migration logic needed |
| R1 | **Giphy free-tier rate limit (50 searches/day)** — could be hit if many family members search GIFs simultaneously | Low | Low — only affects GIF search, not core features | Acceptable for a family app; upgrade to paid tier or switch to Tenor if it becomes an issue |
| R2 | **Google Calendar API quota** — creating events counts against the project's daily API quota | Low | Low — family-scale usage is well within free limits | Monitor via Google Cloud Console; no action needed at launch |
| R3 | **Image object URLs lost on reload** — image attachments in messages disappear after a page refresh | Certain | Medium — messages survive but images don't | Documented as a known limitation. Mitigated in v1.2 by uploading images to a storage service |
| R4 | **In-memory token store lost on server restart** — Google Calendar connection drops if the backend restarts | Certain | Medium — user must re-connect | Pre-existing issue, not introduced by v1.1. Mitigated by adding a persistent token store in a future release |

---

## 12. Open Questions

| # | Question | Owner | Target Resolution |
|---|---|---|---|
| Q1 | Should the GIF API key be embedded in the client bundle (`VITE_` prefix) or proxied through the Express backend to keep it server-side only? | Engineering | Before GIF picker implementation |
| Q2 | Should the "Also add to Google Calendar" toggle remember the user's last choice across sessions, or always default to ON? | Product | Before CreateEventModal implementation |

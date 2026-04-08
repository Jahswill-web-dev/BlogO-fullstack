# HackrPost Backend API Reference

**Base URL:** `http://localhost:4000`

**Auth:** JWT issued as an `httpOnly` cookie (`token`) on login. All protected routes require the cookie or `Authorization: Bearer <token>` header.

**CORS:** Configured for the origin set in `FRONTEND_URL` env var. Requests must include credentials (`credentials: 'include'` in fetch / `withCredentials: true` in axios).

**Swagger UI:** `http://localhost:4000/docs`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/google` | None | Initiate Google OAuth login flow (redirect) |
| GET | `/auth/google/callback` | Passport | OAuth callback — sets JWT cookie, redirects to frontend |
| GET | `/auth/me` | JWT | Returns current authenticated user object |
| GET | `/auth/logout` | None | Clears JWT cookie |

**`GET /auth/me` response:**
```json
{
  "_id": "...",
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "photo": "https://..."
}
```

---

## Twitter / X

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/x/status` | JWT | Check whether the user has connected their X account |
| GET | `/auth/x` | JWT | Initiate X OAuth 2.0 PKCE flow (redirect) |
| GET | `/auth/x/callback` | JWT | X OAuth callback — stores encrypted tokens on user |
| POST | `/x/tweet` | JWT | Post a tweet to the authenticated X account |

**`GET /auth/x/status` response:**
```json
{ "connected": true }
```
or
```json
{ "connected": false }
```
Use this before posting a tweet. If `connected` is `false`, redirect the user to `GET /auth/x` to connect their account.

**`POST /x/tweet` body:**
```json
{ "text": "tweet content here" }
```

---

## User Profile

Mounted at `/profile`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile` | JWT | Create or update user profile |
| GET | `/profile` | JWT | Retrieve current user's profile |

**`POST /profile` body:**
```json
{
  "userNiche": "SaaS tools for indie hackers",
  "targetAudience": "indie hackers and solopreneurs",
  "focusArea": "growth and distribution",
  "productName": "HackrPost",
  "productDescription": "AI-powered content scheduler",
  "productAudience": "content creators",
  "productSolution": "saves 5 hours a week on content"
}
```
`productName`, `productDescription`, `productAudience`, `productSolution` are optional.

**`GET /profile` response:**
```json
{
  "userId": "...",
  "userNiche": "...",
  "targetAudience": "...",
  "focusArea": "...",
  "productName": "...",
  "createdAt": "..."
}
```

---

## Onboarding Pipeline

Run these in order. Each step feeds the next. All require a saved `/profile`.

### Step 1 — AI SaaS Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-saas-profile` | JWT | Generate an AI creator persona from the saved user profile |
| GET | `/saas-profile` | JWT | Retrieve the stored AI SaaS profile |

No request body needed — reads from saved `/profile`.

**`GET /saas-profile` response:**
```json
{
  "userId": "...",
  "content": "AI-generated profile text...",
  "updatedAt": "..."
}
```

---

### Step 2 — Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-categories` | JWT | Generates pain, general, and question category arrays |

No request body needed. Reads from saved profile + AI profile.

**Response:**
```json
{
  "pain": ["..."],
  "general": ["..."],
  "questions": ["..."]
}
```

---

### Step 3 — Content Strategy (Pillars + Subtopics)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-content-strategy` | JWT | Generates 5 content pillars each with subtopics, angles, and goals |

No request body needed. Reads from saved profile + categories.

---

### Step 4 — Generate Posts

Two generation modes are available: random (picks any subtopic) and targeted (user selects specific content pillars).

#### Mode A — Random generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-subtopic-post` | JWT | Generate N posts from randomly selected subtopics across all pillars |

**`POST /generate-subtopic-post` body:**
```json
{ "count": 3, "target_date": "2026-04-09" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `number` | No | Posts to generate. Defaults to `3`, max `20` |
| `target_date` | `string` | No | Calendar day to associate posts with (`YYYY-MM-DD`, e.g. `"2026-04-09"`). Stored as UTC midnight. Use `GET /posts?date=` to retrieve posts for this day |

- Subtopic and content pillar are selected randomly from the user's full content strategy.

---

#### Mode B — Targeted generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-targeted-posts` | JWT | Generate N posts for a specific niche and one or more focus areas |

**`POST /generate-targeted-posts` body:**
```json
{
  "niche": "SaaS productivity tools",
  "focusAreas": ["customer retention", "onboarding"],
  "count": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `niche` | `string` | Yes | The content niche to generate posts for |
| `focusAreas` | `string[]` | Yes | One or more focus areas within that niche |
| `count` | `number` | No | Total posts to generate. Defaults to `3`, max `20` |
| `target_date` | `string` | No | Calendar day to associate posts with (`YYYY-MM-DD`). Stored as UTC midnight |

**How it works:**

For each focus area the backend checks whether a content strategy (pillars + subtopics) has already been generated and cached for that `(niche, focusArea)` pair. If found it reuses the cached strategy; if not it generates fresh pillars and subtopics for that combination and caches them for future requests. The user's `targetAudience` from their saved profile is used as additional context during generation.

**Distribution logic:**

Posts are spread as evenly as possible across the selected focus areas. Any remainder goes to the first focus area(s).

| `count` | `focusAreas` | Distribution |
|---------|-------------|--------------|
| 4 | `["A","B","C","D"]` | 1 each |
| 5 | `["A","B","C","D"]` | A=2, B=1, C=1, D=1 |
| 6 | `["A","B"]` | A=3, B=3 |
| 3 | `["A","B","C","D"]` | A=1, B=1, C=1, D=0 |

Within each focus area a pillar and subtopic are picked at random on every request.

**Response (both modes):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "...",
      "finalPost": "Ready-to-publish post text...",
      "contentPillar": "Retention Loops",
      "subtopic": "Reducing churn with onboarding emails",
      "angle": "...",
      "goal": "...",
      "pain": "...",
      "targetDate": "2026-04-09T00:00:00.000Z"
    }
  ],
  "remaining": 1
}
```
`targetDate` is `null` / omitted when no `target_date` was sent in the request.
`remaining` is how many more posts the user can still generate for that calendar day.

**Error responses:**
- `400` — `niche` or `focusAreas` missing / invalid
- `403` — daily limit reached or date outside plan's scheduling window
- `500` — generation failure

---

## Posts (CRUD)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | JWT | Get all posts for the current user |
| GET | `/posts/:id` | JWT | Get a single post by ID |
| POST | `/posts/:id/schedule` | JWT | Schedule a specific generated post for publishing |
| DELETE | `/posts/:id` | JWT | Delete a post by ID (must be owner) |
| PATCH | `/posts/:id` | JWT | Edit a post's content fields (must be owner) |

### `GET /posts` — query params

| Param | Type | Description |
|-------|------|-------------|
| `contentPillar` | string | Filter by content pillar name |
| `subtopic` | string | Filter by subtopic name |
| `date` | string | Filter by calendar day in `YYYY-MM-DD` format — returns posts whose `targetDate` falls on that UTC day |

All are optional. Examples:
- `GET /posts?contentPillar=Audience+Growth`
- `GET /posts?date=2026-04-09` — returns only posts generated for April 9th

### `POST /posts/:id/schedule`

Schedule a specific generated post (SubtopicPost) for publishing to X. Creates a linked `ScheduledPost` record and enqueues a BullMQ job.

**Path param:** `:id` — the SubtopicPost ID

**Body:**
```json
{
  "scheduled_at": "2026-04-09T09:00:00.000Z",
  "media_urls": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scheduled_at` | `ISO 8601 string` | Yes | UTC datetime to publish. Must be in the future |
| `media_urls` | `string[]` | No | Optional media URLs to attach |

**How it works:** Uses `finalPost` as the tweet content if set, otherwise falls back to `post`. After creating the `ScheduledPost`, the SubtopicPost's `scheduledPostId` is updated to point to the new scheduled record (bidirectional link).

Note: `targetDate` (the calendar day the post was generated for) and `scheduled_at` (when it actually publishes) are independent — a post generated for day 7 can be scheduled to publish on day 9.

**Response `200`:**
```json
{
  "success": true,
  "scheduledPost": {
    "_id": "664a1b2c...",
    "userId": "...",
    "content": "...",
    "status": "pending",
    "scheduledAt": "2026-04-09T09:00:00.000Z",
    "subtopicPostId": "663e...",
    "jobId": "...",
    ...
  }
}
```

**Errors:**
- `400` — `scheduled_at` missing / not a future timestamp, or post has no content (`finalPost` and `post` both unset)
- `403` — post belongs to a different user
- `404` — SubtopicPost not found

---

### `PATCH /posts/:id` — body

Send only the fields you want to update (all optional):

```json
{
  "post": "Updated raw post text",
  "skeleton": "Updated outline / structure",
  "finalPost": "Updated ready-to-publish version",
  "meta": { "anyKey": "anyValue" },
  "scheduledPostId": "664a1b2c..."
}
```

### `PATCH /posts/:id` — response

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "contentPillar": "...",
    "subtopic": "...",
    "post": "Updated raw post text",
    "skeleton": "Updated outline / structure",
    "finalPost": "Updated ready-to-publish version",
    "meta": {},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Returns `403` if the post belongs to a different user, `404` if not found.

### `DELETE /posts/:id` — response

```json
{ "success": true, "message": "Post deleted successfully" }
```

Returns `403` if the post belongs to a different user, `404` if not found.

### Post object shape

```json
{
  "_id": "...",
  "userId": "...",
  "contentPillar": "Audience Growth",
  "subtopic": "Building in public",
  "pain": "...",
  "tone": "conversational",
  "skeleton": "Post outline...",
  "post": "Raw generated post text...",
  "finalPost": "Ready-to-publish tweet text...",
  "meta": {},
  "targetDate": "2026-04-09T00:00:00.000Z",
  "scheduledPostId": "664a1b2c...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

| Field | Description |
|-------|-------------|
| `targetDate` | The calendar day this post was generated for (UTC midnight). `null` if no `target_date` was sent at generation time |
| `scheduledPostId` | ObjectId of the linked `ScheduledPost` if this post has been scheduled. `null` otherwise |

---

## Scheduled Posts

Mounted at `/api/posts`. All endpoints require JWT auth. X account must be connected via `GET /auth/x` before any scheduled post can be published.

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts/schedule` | JWT | Schedule a single post for a specific date and time |
| POST | `/api/posts/schedule/bulk` | JWT | Schedule multiple posts with a start time and posting frequency |
| GET | `/api/posts/scheduled` | JWT | List all scheduled posts for the current user |
| DELETE | `/api/posts/scheduled/:id` | JWT | Cancel a pending scheduled post |
| PATCH | `/api/posts/scheduled/:id` | JWT | Edit the content or scheduled time of a pending post |

---

### `POST /api/posts/schedule`

Schedule a single post to be published at a specific time.

**Body:**
```json
{
  "content": "Your tweet text here (max 280 chars)",
  "scheduled_at": "2026-04-06T09:00:00.000Z",
  "media_urls": ["https://example.com/image.png"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | Yes | Tweet text. Must be non-empty and ≤ 280 characters |
| `scheduled_at` | `ISO 8601 string` | Yes | UTC datetime to publish. Must be in the future |
| `media_urls` | `string[]` | No | Optional list of media URLs to attach |

**Response `200`:**
```json
{
  "success": true,
  "post": {
    "_id": "664a1b2c...",
    "userId": "663f...",
    "content": "Your tweet text here",
    "mediaUrls": [],
    "platform": "x",
    "status": "pending",
    "scheduledAt": "2026-04-06T09:00:00.000Z",
    "jobId": "bullmq-job-id",
    "batchId": null,
    "postedAt": null,
    "errorMessage": null,
    "createdAt": "2026-04-05T12:00:00.000Z",
    "updatedAt": "2026-04-05T12:00:00.000Z"
  }
}
```

**Errors:**
- `400` — `content` missing / empty / over 280 chars, or `scheduled_at` missing / not a future date
- `500` — failed to queue job

---

### `POST /api/posts/schedule/bulk`

Schedule multiple posts with automatic time spacing. All posts in a bulk request share the same `batchId`.

**Body:**
```json
{
  "posts": [
    { "content": "First tweet" },
    { "content": "Second tweet", "media_urls": ["https://example.com/img.png"] },
    { "content": "Third tweet" }
  ],
  "start_time": "2026-04-06T09:00:00.000Z",
  "frequency_hours": 4
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `posts` | `object[]` | Yes | Array of post objects. Must have at least 1 item |
| `posts[].content` | `string` | Yes | Tweet text per post. Max 280 characters |
| `posts[].media_urls` | `string[]` | No | Optional media URLs for that post |
| `start_time` | `ISO 8601 string` | Yes | UTC datetime for the first post. Must be in the future |
| `frequency_hours` | `number` | Yes | Hours between consecutive posts. Must be > 0 |

**How scheduling works:**

`scheduledAt` for each post = `start_time + (index × frequency_hours × 3600 seconds)`

| Index | `start_time` | `frequency_hours` | `scheduledAt` |
|-------|-------------|-------------------|---------------|
| 0 | `09:00` | 4 | `09:00` |
| 1 | `09:00` | 4 | `13:00` |
| 2 | `09:00` | 4 | `17:00` |

**Response `200`:**
```json
{
  "success": true,
  "posts": [
    {
      "_id": "...",
      "content": "First tweet",
      "status": "pending",
      "scheduledAt": "2026-04-06T09:00:00.000Z",
      "batchId": "550e8400-e29b-41d4-a716-446655440000",
      "jobId": "...",
      ...
    },
    { ... },
    { ... }
  ]
}
```

**Errors:**
- `400` — `posts` empty or missing, any post content invalid, `start_time` not future, `frequency_hours` ≤ 0

---

### `GET /api/posts/scheduled`

Returns all scheduled posts for the authenticated user, sorted by `scheduledAt` ascending.

**Query params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | Filter by status: `pending`, `posted`, `failed`, or `cancelled` |

**Example:** `GET /api/posts/scheduled?status=pending`

**Response `200`:**
```json
{
  "success": true,
  "posts": [
    {
      "_id": "...",
      "content": "...",
      "status": "pending",
      "scheduledAt": "2026-04-06T09:00:00.000Z",
      "postedAt": null,
      "batchId": null,
      "platform": "x",
      ...
    }
  ]
}
```

---

### `DELETE /api/posts/scheduled/:id`

Cancel a pending scheduled post. Removes the job from the BullMQ queue and sets status to `cancelled`.

**Only posts with `status: "pending"` can be cancelled.**

**Response `200`:**
```json
{ "success": true, "message": "Post cancelled" }
```

**Errors:**
- `400` — post is not in `pending` status
- `403` — post belongs to a different user
- `404` — post not found

---

### `PATCH /api/posts/scheduled/:id`

Edit the content or scheduled time of a pending post. The old BullMQ job is removed and a new one is queued with the updated delay.

**Only posts with `status: "pending"` can be edited.**

**Body (all fields optional — send only what you want to change):**
```json
{
  "content": "Updated tweet text",
  "scheduled_at": "2026-04-07T10:00:00.000Z",
  "media_urls": ["https://example.com/new-image.png"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Updated tweet text. Must be non-empty and ≤ 280 characters |
| `scheduled_at` | `ISO 8601 string` | New scheduled time. Must be in the future |
| `media_urls` | `string[]` | Replacement media URL list |

**Response `200`:**
```json
{
  "success": true,
  "post": {
    "_id": "...",
    "content": "Updated tweet text",
    "status": "pending",
    "scheduledAt": "2026-04-07T10:00:00.000Z",
    "jobId": "new-bullmq-job-id",
    ...
  }
}
```

**Errors:**
- `400` — `content` over 280 chars / empty, `scheduled_at` not future, or post is not `pending`
- `403` — post belongs to a different user
- `404` — post not found

---

### Scheduled post object shape

```json
{
  "_id": "664a1b2c3d4e5f6789abcdef",
  "userId": "663f1a2b3c4d5e6f78901234",
  "content": "Tweet text to be published",
  "mediaUrls": [],
  "platform": "x",
  "status": "pending",
  "scheduledAt": "2026-04-06T09:00:00.000Z",
  "postedAt": null,
  "errorMessage": null,
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "jobId": "1",
  "subtopicPostId": "663e1a2b3c4d5e6f78901234",
  "createdAt": "2026-04-05T12:00:00.000Z",
  "updatedAt": "2026-04-05T12:00:00.000Z"
}
```

| Field | Description |
|-------|-------------|
| `status` | `pending` → waiting to fire; `posted` → published to X; `failed` → all retries exhausted; `cancelled` → manually cancelled |
| `batchId` | UUID shared by all posts from the same bulk schedule request. `null` for single posts |
| `jobId` | Internal BullMQ job ID. Used for job cancellation/rescheduling — not needed by clients |
| `postedAt` | Set when the worker successfully publishes the post |
| `errorMessage` | Set when all 3 retry attempts fail. Contains the last error message |
| `subtopicPostId` | ObjectId of the source `SubtopicPost` if scheduled via `POST /posts/:id/schedule`. `null` for manually scheduled posts |

### How the worker handles failures

The BullMQ worker retries failed posts up to **3 times** with **exponential backoff** (5 s → 25 s → 125 s). Status stays `pending` during retries. Only after all attempts are exhausted does the status change to `failed` and `errorMessage` get populated.

---

---

## Generation Limits & Plan

### Subscription Plans

| Plan | Posts / day | Schedule ahead |
|------|-------------|----------------|
| `creator` | 4 | 3 days (today + 2 days) |
| `builder` | 7 | 7 days (1 week) |
| `authority` | 12 | 14 days (2 weeks) |

All post generation endpoints (`/generate-subtopic-post`, `/generate-targeted-posts`, `/api/generate-post`) enforce both the daily cap and the scheduling window. The cap is per **calendar day (UTC)** based on the `target_date` / `scheduledFor` field — not when the request is made.

---

### `POST /api/generate-post`

Targeted post generation with built-in plan limit enforcement.

**Auth:** JWT required.

**Body:**
```json
{
  "niche": "SaaS productivity tools",
  "focusAreas": ["customer retention", "onboarding"],
  "count": 2,
  "scheduledFor": "2026-04-09"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `niche` | `string` | Yes | The content niche |
| `focusAreas` | `string[]` | Yes | One or more focus areas within the niche |
| `count` | `number` | No | Posts to generate. Defaults to `1`, max `20` |
| `scheduledFor` | `string` | Yes | ISO date string for the target calendar day (e.g. `"2026-04-09"`) |

**Response `200`:**
```json
{
  "success": true,
  "posts": [ { "finalPost": "...", "contentPillar": "...", ... } ],
  "remaining": 2
}
```
`remaining` — how many more posts the user can generate for `scheduledFor` after this request.

**Errors:**
- `400` — missing required fields or invalid date
- `403` — daily limit reached (`"Daily post limit reached for 2026-04-09"`) or date too far ahead (`"Your plan does not allow scheduling that far ahead"`)
- `500` — generation failure

---

### `GET /api/generation-status`

Returns usage and availability for a list of dates. Powers the frontend calendar UI.

**Auth:** JWT required.

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `dates[]` | `string[]` | Yes | One or more ISO date strings, e.g. `?dates[]=2026-04-07&dates[]=2026-04-08` |

**Example:** `GET /api/generation-status?dates[]=2026-04-07&dates[]=2026-04-08&dates[]=2026-04-14`

**Response `200`:**
```json
{
  "success": true,
  "dates": [
    {
      "date": "2026-04-07",
      "used": 2,
      "limit": 4,
      "remaining": 2,
      "withinWindow": true
    },
    {
      "date": "2026-04-08",
      "used": 0,
      "limit": 4,
      "remaining": 4,
      "withinWindow": true
    },
    {
      "date": "2026-04-14",
      "used": 0,
      "limit": 4,
      "remaining": 4,
      "withinWindow": false
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `used` | Posts already generated / logged for that UTC calendar day |
| `limit` | Max posts allowed per day on the user's plan |
| `remaining` | `limit - used` (floored at 0) |
| `withinWindow` | `true` if the date falls within the user's scheduling window (today through today + `scheduleDaysAhead`). Dates outside this window cannot be generated for. |

**Errors:**
- `400` — `dates[]` query param missing
- `500` — lookup failure

---

### `GET /api/user/plan`

Returns the user's current plan, limits, and today's usage.

**Auth:** JWT required.

**Response `200`:**
```json
{
  "plan": "creator",
  "postsPerDay": 4,
  "scheduleDaysAhead": 1,
  "usedToday": 1,
  "remainingToday": 3
}
```

| Field | Description |
|-------|-------------|
| `plan` | `"creator"`, `"builder"`, or `"authority"` |
| `postsPerDay` | Max posts per calendar day on this plan |
| `scheduleDaysAhead` | How many days into the future posts can be scheduled |
| `usedToday` | Posts generated for today's UTC calendar day |
| `remainingToday` | `postsPerDay - usedToday` (floored at 0) |

**Errors:**
- `500` — lookup failure

---

### `PATCH /api/user/plan`

Updates the authenticated user's subscription plan.

**Auth:** JWT required.

**Body:**
```json
{ "plan": "builder" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan` | `string` | Yes | One of `"creator"`, `"builder"`, `"authority"` |

**Response `200`:**
```json
{ "success": true, "plan": "builder" }
```

**Errors:**
- `400` — invalid or missing `plan` value
- `404` — user not found
- `500` — update failure

---

## Focus Areas (Onboarding Helper)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/suggest-focus-areas` | JWT | Returns AI-suggested focus area options based on niche and audience |

**`POST /suggest-focus-areas` body:**
```json
{
  "niche": "SaaS tools",
  "audience": "indie hackers"
}
```

**Response:**
```json
{ "focusAreas": ["...", "...", "..."] }
```

---

## Error Responses

All endpoints return JSON errors in one of two shapes:

```json
{ "error": "Human-readable message" }
```
```json
{ "success": false, "message": "Human-readable message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / missing required fields |
| `401` | Not authenticated (missing or invalid JWT) |
| `403` | Forbidden — authenticated but not the resource owner |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Notes

- **Cookie vs header auth:** The JWT is set as an `httpOnly` cookie on login. Alternatively send `Authorization: Bearer <token>` on each request.
- **Token security:** X OAuth tokens are stored AES-256-CBC encrypted on the User document.
- **AI stack:** LangChain + OpenAI GPT-5.1 (structured outputs) + fine-tuned model for post generation.
- **CORS:** Set `FRONTEND_URL` in `.env` to your frontend origin (e.g. `http://localhost:3000`).
- **Swagger UI:** Full interactive docs at `http://localhost:4000/docs`.
- **Test UI:** Manual request tool at `http://localhost:4000/test-ui`.
- **Scheduler:** BullMQ backed by Upstash Redis (`REDIS_URL` env var). The worker starts automatically with the server. Posts must be scheduled at least a few seconds in the future — the delay is computed as `scheduledAt - Date.now()` at the moment of scheduling.
- **X account required for publishing:** Scheduling a post succeeds even if no X account is connected, but the worker will fail when it tries to publish. Connect X first via `GET /auth/x`.

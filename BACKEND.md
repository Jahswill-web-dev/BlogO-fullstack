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
{ "count": 3 }
```
- `count` defaults to `3`, max `20`.
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
      "pain": "..."
    }
  ]
}
```

**Error responses:**
- `400` — `niche` or `focusAreas` missing / invalid
- `500` — generation failure

---

## Posts (CRUD)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | JWT | Get all posts for the current user |
| GET | `/posts/:id` | JWT | Get a single post by ID |
| DELETE | `/posts/:id` | JWT | Delete a post by ID (must be owner) |
| PATCH | `/posts/:id` | JWT | Edit a post's content fields (must be owner) |

### `GET /posts` — query params

| Param | Type | Description |
|-------|------|-------------|
| `contentPillar` | string | Filter by content pillar name |
| `subtopic` | string | Filter by subtopic name |

Both are optional. Example: `GET /posts?contentPillar=Audience+Growth`

### `PATCH /posts/:id` — body

Send only the fields you want to update (all optional):

```json
{
  "post": "Updated raw post text",
  "skeleton": "Updated outline / structure",
  "finalPost": "Updated ready-to-publish version",
  "meta": { "anyKey": "anyValue" }
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
  "createdAt": "...",
  "updatedAt": "..."
}
```

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

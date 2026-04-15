# HackrPost Backend API Reference

**Base URL:** `http://localhost:4000`

**Auth:** JWT is issued as an `httpOnly` cookie named `token` on login. Protected routes also accept `Authorization: Bearer <token>`.

**CORS:** Requests from the frontend must include credentials.

**Swagger UI:** `http://localhost:4000/docs`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/google` | None | Start Google OAuth login |
| GET | `/auth/google/callback` | Passport | OAuth callback, sets JWT cookie, redirects to frontend |
| GET | `/auth/me` | JWT | Return the current authenticated user |
| GET | `/auth/logout` | None | Clear JWT cookie |

### `GET /auth/me`

**Response `200`:**
```json
{
  "_id": "...",
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "photo": "https://...",
  "trial_expires_at": "2026-04-18T10:30:00.000Z",
  "is_paid": false,
  "plan": "creator",
  "polarCustomerId": "cus_..."
}
```

Notes:
- `trial_expires_at` is exactly 72 hours after signup
- `is_paid` becomes `true` only after Polar payment/subscription confirmation

---

## Billing / Trial Paywall

### Trial rules

- New users start on a 3-day free trial
- If `is_paid = true`, protected generation/scheduling actions are allowed
- If `is_paid = false` and current time is before `trial_expires_at`, protected actions are allowed
- If `is_paid = false` and current time is after `trial_expires_at`, protected generation/scheduling actions return `402`

### Important frontend rule

When retrying a blocked request after trial expiry, the frontend must send the selected plan:

```json
{ "planId": "builder" }
```

Valid values:
- `creator`
- `builder`
- `authority`

This ensures the generated Polar checkout URL matches the user’s chosen tier.

### `POST /api/checkout`

Create a Polar checkout session for a specific plan.

**Auth:** JWT required

**Body:**
```json
{ "planId": "builder" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | `string` | Yes | One of `"creator"`, `"builder"`, `"authority"` |

**Response `200`:**
```json
{
  "checkoutUrl": "https://polar.sh/checkout/..."
}
```

**Errors:**
- `400` - invalid or missing `planId`
- `500` - failed to create checkout session

### `GET /api/portal`

Return the Polar customer portal URL.

**Auth:** JWT required

**Response `200`:**
```json
{
  "portalUrl": "https://polar.sh/customer-portal/..."
}
```

### Trial-expired responses on protected actions

#### 1. Plan selection required

Returned when the trial is expired and the frontend has not yet provided a `planId`.

**Response `402`:**
```json
{
  "error": "TRIAL_EXPIRED",
  "message": "Your trial has ended. Select a plan to continue to checkout.",
  "paywall": {
    "reason": "plan_selection_required",
    "requiresPayment": true,
    "requiresPlanSelection": true,
    "availablePlanIds": ["creator", "builder", "authority"],
    "trialExpiresAt": "2026-04-18T10:30:00.000Z"
  }
}
```

Frontend behavior:
- show paywall UI
- let the user choose a plan
- retry the same protected request with `planId`

#### 2. Checkout URL ready

Returned when the trial is expired and the frontend includes `planId`.

**Response `402`:**
```json
{
  "error": "TRIAL_EXPIRED",
  "message": "Your 3-day free trial has ended. Payment is required to continue.",
  "paywall": {
    "reason": "trial_expired",
    "requiresPayment": true,
    "selectedPlanId": "builder",
    "checkoutUrl": "https://polar.sh/checkout/...",
    "trialExpiresAt": "2026-04-18T10:30:00.000Z"
  }
}
```

Frontend behavior:
- redirect to `paywall.checkoutUrl`

#### 3. Invalid plan selection

**Response `400`:**
```json
{
  "error": "INVALID_PLAN_ID",
  "message": "planId must be one of: creator, builder, authority"
}
```

### Polar webhook behavior

The backend restores entitlements from Polar webhook events. On successful payment/subscription events, it:

- finds the user by `polarCustomerId`
- maps the paid Polar `productId` to the internal plan
- sets `is_paid = true`
- sets `plan = "creator" | "builder" | "authority"`

Use frontend state only for plan selection before checkout. Treat webhook-confirmed backend state as the source of truth for access.

---

## Twitter / X

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/x/status` | JWT | Check whether the user has connected X |
| GET | `/auth/x` | JWT | Start X OAuth flow |
| GET | `/auth/x/callback` | JWT | X OAuth callback |
| POST | `/x/tweet` | JWT | Post a tweet immediately |

### `GET /auth/x/status`

**Response `200`:**
```json
{ "connected": true }
```

or

```json
{ "connected": false }
```

---

## User Profile

Mounted at `/profile`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile` | JWT | Create or update profile |
| GET | `/profile` | JWT | Fetch current profile |

### `POST /profile`

**Body:**
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

---

## Onboarding Pipeline

Run these in order. All require a saved `/profile`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate-saas-profile` | JWT | Generate AI SaaS profile |
| GET | `/saas-profile` | JWT | Fetch stored AI SaaS profile |
| POST | `/generate-categories` | JWT | Generate categories |
| POST | `/generate-content-strategy` | JWT | Generate pillars and subtopics |

---

## Post Generation

The following generation endpoints are trial-paywall protected:

- `POST /generate-subtopic-post`
- `POST /generate-targeted-posts`
- `POST /api/generate-post`

These routes may return the `402` paywall responses documented in the Billing / Trial Paywall section.

### `POST /generate-subtopic-post`

Generate posts from random subtopics.

**Body:**
```json
{
  "count": 3,
  "target_date": "2026-04-09",
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `number` | No | Defaults to `3` |
| `target_date` | `string` | No | `YYYY-MM-DD` calendar day |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

### `POST /generate-targeted-posts`

Generate posts for a niche and one or more focus areas.

**Body:**
```json
{
  "niche": "SaaS productivity tools",
  "focusAreas": ["customer retention", "onboarding"],
  "count": 5,
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `niche` | `string` | Yes | Content niche |
| `focusAreas` | `string[]` | Yes | One or more focus areas |
| `count` | `number` | No | Defaults to `3` |
| `target_date` | `string` | No | `YYYY-MM-DD` calendar day |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Response `200`:**
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

**Errors:**
- `400` - missing required fields or invalid `planId`
- `402` - trial expired
- `403` - daily limit reached or requested date is outside plan window
- `500` - generation failure

### `POST /api/generate-post`

Targeted generation with built-in plan-limit enforcement.

**Body:**
```json
{
  "niche": "SaaS productivity tools",
  "focusAreas": ["customer retention", "onboarding"],
  "count": 2,
  "scheduledFor": "2026-04-09",
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `niche` | `string` | Yes | Content niche |
| `focusAreas` | `string[]` | Yes | One or more focus areas |
| `count` | `number` | No | Defaults to `1` |
| `scheduledFor` | `string` | Yes | ISO date string |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Errors:**
- `400` - missing fields, invalid date, or invalid `planId`
- `402` - trial expired
- `403` - daily limit reached or date too far ahead
- `500` - generation failure

### `GET /api/generation-status`

Return generation usage and availability for a list of dates.

**Query:** `?dates[]=2026-04-07&dates[]=2026-04-08`

---

## Posts (CRUD)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | JWT | Get all posts for current user |
| GET | `/posts/:id` | JWT | Get a single post |
| POST | `/posts/:id/schedule` | JWT | Schedule a generated post |
| DELETE | `/posts/:id` | JWT | Delete a post |
| PATCH | `/posts/:id` | JWT | Edit a post |

### `POST /posts/:id/schedule`

This route is trial-paywall protected.

**Body:**
```json
{
  "scheduled_at": "2026-04-09T09:00:00.000Z",
  "media_urls": [],
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scheduled_at` | `string` | Yes | Future ISO timestamp |
| `media_urls` | `string[]` | No | Media URLs |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Errors:**
- `400` - invalid request or invalid `planId`
- `402` - trial expired
- `403` - resource belongs to another user
- `404` - post not found

---

## Scheduled Posts

Mounted at `/api/posts`.

Trial-paywall protected write routes:
- `POST /api/posts/schedule`
- `POST /api/posts/schedule/bulk`
- `PATCH /api/posts/scheduled/:id`

Non-paywalled routes:
- `GET /api/posts/scheduled`
- `DELETE /api/posts/scheduled/:id`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts/schedule` | JWT | Schedule one post |
| POST | `/api/posts/schedule/bulk` | JWT | Bulk schedule posts |
| GET | `/api/posts/scheduled` | JWT | List scheduled posts |
| DELETE | `/api/posts/scheduled/:id` | JWT | Cancel pending scheduled post |
| PATCH | `/api/posts/scheduled/:id` | JWT | Edit pending scheduled post |

### `POST /api/posts/schedule`

**Body:**
```json
{
  "content": "Your tweet text here",
  "scheduled_at": "2026-04-06T09:00:00.000Z",
  "media_urls": ["https://example.com/image.png"],
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | Yes | Non-empty tweet text |
| `scheduled_at` | `string` | Yes | Future ISO timestamp |
| `media_urls` | `string[]` | No | Media URLs |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Errors:**
- `400` - invalid request or invalid `planId`
- `402` - trial expired
- `500` - failed to queue job

### `POST /api/posts/schedule/bulk`

**Body:**
```json
{
  "posts": [
    { "content": "First tweet" },
    { "content": "Second tweet", "media_urls": ["https://example.com/img.png"] },
    { "content": "Third tweet" }
  ],
  "start_time": "2026-04-06T09:00:00.000Z",
  "frequency_hours": 4,
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `posts` | `object[]` | Yes | Array of posts |
| `posts[].content` | `string` | Yes | Post text |
| `posts[].media_urls` | `string[]` | No | Media URLs |
| `start_time` | `string` | Yes | Future ISO timestamp |
| `frequency_hours` | `number` | Yes | Hours between posts |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Errors:**
- `400` - invalid request or invalid `planId`
- `402` - trial expired

### `GET /api/posts/scheduled`

Optional query:

| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | `pending`, `posted`, `failed`, or `cancelled` |

### `PATCH /api/posts/scheduled/:id`

**Body:**
```json
{
  "content": "Updated tweet text",
  "scheduled_at": "2026-04-07T10:00:00.000Z",
  "media_urls": ["https://example.com/new-image.png"],
  "planId": "builder"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | No | Updated content |
| `scheduled_at` | `string` | No | New future ISO timestamp |
| `media_urls` | `string[]` | No | Replacement media URLs |
| `planId` | `string` | No* | Required only when retrying after `402 TRIAL_EXPIRED` |

**Errors:**
- `400` - invalid request or invalid `planId`
- `402` - trial expired
- `403` - resource belongs to another user
- `404` - post not found

---

## Generation Limits & Plan

### Subscription plans

| Plan | Posts / day | Schedule ahead |
|------|-------------|----------------|
| `creator` | 4 | 3 days |
| `builder` | 7 | 7 days |
| `authority` | 12 | 14 days |

### `GET /api/user/plan`

Return the current plan, limits, trial state, and payment state.

**Response `200`:**
```json
{
  "plan": "creator",
  "postsPerDay": 4,
  "scheduleDaysAhead": 3,
  "usedToday": 1,
  "remainingToday": 3,
  "hasActiveSubscription": true,
  "planExpiresAt": "2026-05-01T00:00:00.000Z",
  "isPaid": false,
  "trialExpiresAt": "2026-04-18T10:30:00.000Z"
}
```

| Field | Description |
|-------|-------------|
| `plan` | Current entitlement tier |
| `postsPerDay` | Daily generation cap |
| `scheduleDaysAhead` | Schedule window |
| `usedToday` | Usage for today |
| `remainingToday` | Remaining usage today |
| `hasActiveSubscription` | Whether a Polar customer/subscription is linked |
| `planExpiresAt` | Current subscription period end, if known |
| `isPaid` | Whether access is currently paid |
| `trialExpiresAt` | Trial expiration timestamp |

### `POST /api/user/sync-plan`

Query Polar for active subscription data and sync the local user record.

Use this after returning from Polar checkout as a frontend safety net if webhook processing is delayed.

**Response `200`:**
```json
{
  "plan": "builder",
  "synced": true
}
```

Possible alternate response:
```json
{
  "plan": "creator",
  "synced": false,
  "message": "No active subscription found in Polar"
}
```

### `PATCH /api/user/plan`

Manually update the current plan.

**Body:**
```json
{ "plan": "builder" }
```

---

## Focus Areas

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/suggest-focus-areas` | JWT | Suggest focus areas based on niche and audience |

---

## Error Responses

Common error shapes:

```json
{ "error": "Human-readable message" }
```

or

```json
{ "success": false, "message": "Human-readable message" }
```

Common status codes:

| Status | Meaning |
|--------|---------|
| `400` | Bad request |
| `401` | Not authenticated |
| `402` | Trial expired / payment required |
| `403` | Forbidden |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Notes

- Send credentials with every frontend request
- Polar webhook events are the source of truth for `is_paid` and final paid `plan`
- The frontend should persist the user’s selected plan and reuse it when retrying a blocked protected action
- Test UI is available at `http://localhost:4000/test-ui`

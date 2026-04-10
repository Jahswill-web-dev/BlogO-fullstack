# BlogO Frontend — Codebase Map

> **Two purposes:** (1) AI assistant reference for writing exact, copy-paste-ready code changes. (2) Human navigation guide for developers new to this codebase.

---

## 1. PROJECT OVERVIEW

**What it is:** BlogO is an AI-powered social media content generation and scheduling SaaS product aimed at startups and solo founders. It lets users generate batches of Twitter/X posts using AI, schedule them onto a calendar, and publish them automatically to their connected X account.

**The problem it solves:** Writing and scheduling consistent social media content is time-consuming. BlogO automates post generation by taking a user's niche (e.g. "SEO", "Email Marketing") and a focus area within that niche, sending those to an AI backend, and returning polished posts ready to schedule.

**How a user interacts with it:**

1. **Sign up / Sign in** — OAuth via Google or X (no email/password).
2. **Onboarding (`/startup`)** — A multi-step wizard that collects: niche, focus area, target audience, and optional product details. Submitting this triggers the backend to generate a content strategy and an initial batch of posts.
3. **Dashboard (`/dashboard`)** — The main workspace. Users see a monthly calendar, click days to view posts, open the Generate Panel to request more posts, schedule posts to specific dates/times, and publish directly to X.
4. **Archive (`/archive`)** — View previously published posts grouped by day, with the ability to open them in the edit/schedule modal.
5. **Pricing (`/pricing`)** — Browse the three subscription tiers and initiate checkout via Polar.sh.

---

## 2. HOW IT ALL FITS TOGETHER

### Big Picture

```
Browser (User)
  │
  ├─ Next.js App Router (src/app/)
  │    ├─ Pages render React components
  │    ├─ "use client" components manage local state
  │    └─ Auth guard via useProtectedRoute() hook
  │
  ├─ Data Layer
  │    ├─ apiFetch() — thin fetch wrapper (src/lib/api.ts)
  │    ├─ api.* methods — named wrappers over apiFetch
  │    └─ React Query (TanStack) — query caching (staleTime: 5 min)
  │
  ├─ Auth
  │    ├─ OAuth redirect → backend → httpOnly cookie set
  │    └─ useAuth() reads cookie via GET /auth/me
  │
  └─ External Services
       ├─ REST API Backend (localhost:4000 / NEXT_PUBLIC_API_URL)
       │    ├─ LangChain + OpenAI GPT for content generation
       │    ├─ MongoDB for post/user/schedule storage
       │    └─ Swagger docs at /docs
       └─ Polar.sh — subscription billing (checkout + portal)
```

### Request Flow (typical page load)

```
User visits /dashboard
  → useProtectedRoute() fires
    → useAuth() calls GET /auth/me
      → 401: redirect to /signin
      → 200: isReady = true, page renders
        → Promise.allSettled([GET /posts, GET /api/posts/scheduled])
          → merge CRUD posts + scheduled metadata into Post[] state
            → CalendarCard renders posts grouped by day
```

### Post Generation Flow

```
User opens GeneratePanel
  → picks niche, focus area, count, target date
  → calls onGenerate() prop (defined in dashboard/page.tsx)
    → api.generatePost({ niche, focusAreas, count, scheduledFor })
      → POST /api/generate-post (with plan-limit enforcement)
        → 403: show daily limit error in panel
        → 200: new posts appended to posts[] state
```

---

## 3. FOLDER STRUCTURE

```
blogofrontend/
│
├── src/
│   ├── app/                          # Next.js App Router — pages live here
│   │   ├── layout.tsx                # Root HTML shell: applies fonts, wraps with <Providers>
│   │   ├── page.tsx                  # "/" route — renders <LandingPage> (old landing)
│   │   ├── globals.css               # Tailwind v4 import, CSS variables (oklch), custom scrollbars, font utilities
│   │   ├── fonts.ts                  # Loads Geist, IBM Plex Serif, Kumbh Sans via next/font/google
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main app dashboard — calendar, post management, generate panel (~1003 lines)
│   │   │
│   │   ├── archive/
│   │   │   └── page.tsx              # View of previously posted tweets with month navigation
│   │   │
│   │   ├── pricing/
│   │   │   ├── page.tsx              # Pricing page shell (dark bg layout)
│   │   │   └── PricingPageContent.tsx # Three plan cards + Polar checkout logic
│   │   │
│   │   ├── signin/
│   │   │   └── page.tsx              # Login page — Google + X OAuth buttons
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx              # Sign-up page — Google + X OAuth buttons (mirrors signin)
│   │   │
│   │   ├── startup/
│   │   │   └── page.tsx              # Onboarding wizard: niche → focus → audience → product → generate
│   │   │
│   │   └── newlanding/
│   │       └── page.tsx              # New landing page route (renders <NewLandingPage>)
│   │
│   ├── components/
│   │   ├── Providers.tsx             # TanStack QueryClient + Sonner <Toaster> — wraps entire app
│   │   ├── GeneratePanel.tsx         # Slide-over panel for generating posts (~900 lines)
│   │   ├── PlanUsageBar.tsx          # Progress bar showing today's post count vs. plan limit
│   │   ├── UpgradePrompt.tsx         # Inline upgrade CTA that triggers Polar checkout
│   │   ├── ScheduleDatePicker.tsx    # Date picker showing 14 days; color-coded by capacity/lock state
│   │   │
│   │   ├── landingPage/              # Old landing page (currently served at "/")
│   │   │   ├── landingPage.tsx       # Layout shell for old landing
│   │   │   └── sections/
│   │   │       ├── hero.tsx
│   │   │       ├── problemSection.tsx
│   │   │       ├── howItWorks.tsx
│   │   │       ├── cta.tsx
│   │   │       └── footer.tsx
│   │   │
│   │   ├── newLandingPage/           # New/redesigned landing page (served at "/newlanding")
│   │   │   ├── newLandingPage.tsx    # Layout shell for new landing
│   │   │   └── sections/
│   │   │       ├── hero.tsx
│   │   │       ├── problemSection.tsx
│   │   │       ├── solutionSection.tsx
│   │   │       ├── contrastBlock.tsx
│   │   │       ├── contrastCopy.tsx
│   │   │       ├── identityShift.tsx
│   │   │       ├── valueTable.tsx
│   │   │       ├── howItWorks.tsx
│   │   │       ├── whoItsForSection.tsx
│   │   │       ├── cta.tsx
│   │   │       └── footer.tsx
│   │   │
│   │   ├── modules/                  # Feature-level components used by app pages
│   │   │   ├── navbar.tsx            # Top navigation bar with mobile menu
│   │   │   ├── DashboardSidebar.tsx  # Left sidebar (nav links: Dashboard, Archive, Settings)
│   │   │   ├── CalendarCard.tsx      # Monthly calendar grid with week tabs and day-post panel
│   │   │   ├── PostDetailPopup.tsx   # Full post detail modal with inline edit, schedule, publish
│   │   │   ├── DayPostsPopup.tsx     # All posts for a selected day (desktop modal / mobile sheet)
│   │   │   ├── EditScheduleModal.tsx # Full-screen modal: post list + editor + calendar scheduler
│   │   │   ├── OnboardingPostsModal.tsx  # Review + schedule-all flow for freshly generated posts
│   │   │   ├── AutoSchedulePopover.tsx   # Popover/sheet for bulk auto-scheduling with frequency
│   │   │   ├── ConnectXModal.tsx     # Prompt to connect X account (redirects to OAuth)
│   │   │   ├── PlanSwitcherModal.tsx # Plan comparison modal with upgrade/downgrade actions
│   │   │   ├── SocialMediaModal.tsx  # Platform selector modal (LinkedIn, Twitter, Facebook, etc.)
│   │   │   ├── ScheduleModal.tsx     # Single-post date/time scheduling modal
│   │   │   ├── PostCard.tsx          # Individual post card with status badge and action dropdown
│   │   │   └── WeeklyOverview.tsx    # Week summary — groups posts by day for the current week
│   │   │
│   │   └── ui/                       # Design-system atoms (shadcn/ui + custom)
│   │       ├── buttons/
│   │       │   ├── button.tsx        # Base button with CVA variants (shadcn style)
│   │       │   ├── gradientButton.tsx        # Solid orange→purple→blue gradient fill button
│   │       │   └── gradientBorderButton.tsx  # Gradient border with dark inner fill button
│   │       ├── button.tsx            # Re-export / shadcn button (used by form primitives)
│   │       ├── card.tsx              # Card container with header/content/footer slots
│   │       ├── dialog.tsx            # Radix UI dialog primitives
│   │       ├── form.tsx              # React Hook Form + Radix label integration
│   │       ├── input.tsx             # Styled <input>
│   │       ├── label.tsx             # Radix UI label
│   │       ├── textarea.tsx          # Styled <textarea>
│   │       ├── table.tsx             # Table component wrappers
│   │       ├── pill.tsx              # Small badge/pill component
│   │       ├── sonner.tsx            # Toaster config (re-export from sonner)
│   │       ├── googleloginbutton.tsx # Google sign-in button with SVG logo
│   │       ├── pricingCard.tsx       # Pricing plan card (title, price, features, CTA)
│   │       ├── pricingButton.tsx     # SolidButton used on non-highlighted pricing cards
│   │       └── LoadingSpinner.tsx    # Full-screen centered spinner
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Fetches current user from /auth/me; returns { user, loading, loggedIn }
│   │   └── useProtectedRoute.ts     # Auth guard: redirects to /signin if not logged in
│   │
│   └── lib/
│       ├── api.ts                   # All API types + apiFetch wrapper + api.* method object
│       ├── utils.ts                 # cn() helper — merges Tailwind classes safely
│       └── niches.ts                # FIXED_NICHES array: 7 niches × 20-23 focus areas each
│
├── public/                           # Static assets (images, icons)
│   └── images/
│       └── x-logo.png               # X logo used on signin page
│
├── next.config.ts                    # Next.js config: allowed image domains
├── tsconfig.json                     # TypeScript: strict mode, path alias @/* → src/*
├── postcss.config.mjs                # PostCSS config for Tailwind v4
├── components.json                   # shadcn/ui config (new-york style, tsx)
├── package.json                      # Dependencies and scripts
├── CLAUDE.md                         # Design system reference for AI assistants
└── BACKEND.md                        # Full backend API documentation
```

---

## 4. CORE CONCEPTS & DOMAIN LANGUAGE

### Post
A piece of AI-generated social media content. Lives in two places simultaneously:
- **CRUD post** (`ApiPost`): stored in the backend's `/posts` collection. Has `finalPost` (the text), `status`, `targetDate`, and `meta.scheduledPostId` linking it to a ScheduledPost.
- **Frontend `Post`**: the merged, normalized shape used throughout the UI — combines CRUD data with scheduling metadata.

### ScheduledPost
A time-based publishing job. Created when a user schedules a post. Lives at `/api/posts/scheduled`. Has its own `status`: `pending` → `posted` / `failed` / `cancelled`. The backend's scheduler fires these automatically.

### CRUD Post + Scheduled Post Merge
The dashboard fetches both collections on load and merges them. A CRUD post's `meta.scheduledPostId` points to a ScheduledPost. If the ScheduledPost is `cancelled` or `failed`, the CRUD post reverts to `draft` status in the UI. This merge logic lives at `src/app/dashboard/page.tsx`.

### Niche
One of 7 fixed content verticals (e.g. "SEO", "Email Marketing", "X / Twitter Growth"). Each niche has 20-23 **focus areas** — specific subtopics within the niche. Defined in `src/lib/niches.ts`.

### Focus Area
A specific subtopic within a niche. For example, within "SEO": "Keyword Research", "Technical SEO Fundamentals", "Link Building". This is what the AI uses to generate targeted post content.

### Plan
A subscription tier controlling two limits:
- `postsPerDay` — how many posts can be generated per day
- `scheduleDaysAhead` — how far in the future posts can be scheduled

| Plan | Posts/day | Days ahead | Price |
|------|-----------|------------|-------|
| Creator | 4 | 3 | Free (default) |
| Builder | 7 | 7 | $39/mo |
| Authority | 12 | 14 | $59/mo |

### Generation Status
Per-date usage data returned by `GET /api/generation-status`. Tells the frontend how many posts have been generated for each date (used to color-code the ScheduleDatePicker).

### Onboarding Pipeline
The sequence of backend calls that happens when a new user completes the startup wizard:
```
api.saveProfile() → api.generateContentStrategy() → api.generatePosts()
```
On success, the user is redirected to `/dashboard?schedule=true` which triggers the `OnboardingPostsModal` to open automatically.

### dayKey
A date string in `YYYY-MM-DD` format, used as a stable key for grouping posts by calendar day. Exported from `EditScheduleModal.tsx` and used in both `CalendarCard` and `dashboard/page.tsx`.

---

## 5. FILE-BY-FILE BREAKDOWN

---

### `src/lib/api.ts`

**What this file is for:** The single source of truth for all backend communication. Defines all TypeScript types for API shapes, exports the `apiFetch` generic fetch wrapper, and exports an `api` object with named methods for every endpoint.

**Exports:** `BASE`, `apiFetch`, `AuthUser`, `UserProfilePayload`, `UserProfile`, `ApiPost`, `ScheduledApiPost`, `api`

---

#### `BASE: string`
- The API base URL. Reads from `process.env.NEXT_PUBLIC_API_URL`, defaults to `"http://localhost:4000"`.
- **Used by:** `ConnectXModal.tsx` (imports `BASE` directly for OAuth redirect URL), all `apiFetch` calls.

---

#### `apiFetch<T>(path: string, init: RequestInit = {}): Promise<T>`
- **What it does:** Wraps `fetch` with base URL, `credentials: "include"` (for cookie auth), JSON headers. On non-OK response, parses the error body and throws an `Error` with `.status` attached.
- **Parameters:**
  - `path` — URL path starting with `/` (e.g. `"/auth/me"`)
  - `init` — standard `RequestInit` options merged over the base config
- **Returns:** Parsed JSON response body cast to `T`. Returns `undefined` for empty responses.
- **Throws:** `Error` with `.status: number` set (e.g. `403` for plan limits, `401` for auth failures).
- **Called by:** Every `api.*` method.

---

#### Types

```typescript
// User returned by GET /auth/me
type AuthUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Payload for POST /profile (onboarding)
type UserProfilePayload = {
  userNiche: string;
  targetAudience: string;
  focusArea: string;
  productName?: string;
  productDescription?: string;
  productAudience?: string;
  productSolution?: string;
};

// Returned by GET /profile
type UserProfile = {
  userId: string;
  userNiche: string;
  targetAudience: string;
  focusArea: string;
  productName?: string;
  createdAt: string;
};

// Returned by GET /posts (a single post item)
type ApiPost = {
  _id: string;
  finalPost: string;         // the post text — always use this field, not 'post'
  status?: string;
  scheduledDate?: string;
  targetDate?: string;
  meta?: Record<string, unknown>;  // meta.scheduledPostId links to a ScheduledPost
};

// Returned by GET /api/posts/scheduled and POST /api/posts/schedule
type ScheduledApiPost = {
  _id: string;
  content: string;
  status: "pending" | "posted" | "failed" | "cancelled";
  scheduledAt: string;       // ISO datetime string
  postedAt: string | null;
  batchId: string | null;
  platform: string;
};
```

---

#### `api` object — all methods

```typescript
api.getMe(): Promise<AuthUser>
// GET /auth/me — 401 if not logged in

api.logout(): Promise<void>
// GET /auth/logout

api.checkXStatus(): Promise<{ connected: boolean }>
// GET /auth/x/status

api.getProfile(): Promise<UserProfile>
// GET /profile — 404 if no profile set (triggers redirect to /startup)

api.saveProfile(body: UserProfilePayload): Promise<{ success: boolean; profile: unknown }>
// POST /profile — saves onboarding data

api.generateContentStrategy(): Promise<unknown>
// POST /generate-content-strategy — step 2 of onboarding pipeline

api.generatePosts(body: { count?: number; target_date?: string }): Promise<{ success: boolean; posts: unknown[] }>
// POST /generate-subtopic-post — random mode: picks subtopics from DB

api.generateTargetedPosts(body: {
  niche: string;
  focusAreas: string[];
  count: number;
  target_date?: string;
}): Promise<{ success: boolean; posts: unknown[] }>
// POST /generate-targeted-posts — targeted mode: generates for specific niche/focus areas

api.generatePost(body: {
  niche: string;
  focusAreas: string[];
  count: number;
  scheduledFor: string;     // ISO date string
}): Promise<{ success: boolean; posts: unknown[]; remaining: number }>
// POST /api/generate-post — generates with plan-limit enforcement
// Throws 403 error when daily limit is reached

api.getPosts(): Promise<unknown>
// GET /posts — returns all user posts (array or { posts: [...] } shape)

api.updatePost(id: string, fields: { finalPost?: string; meta?: Record<string, unknown> }): Promise<{ success: boolean; data: unknown }>
// PATCH /posts/:id — edit post content or meta

api.deletePost(id: string): Promise<{ success: boolean; message: string }>
// DELETE /posts/:id

api.postTweet(text: string): Promise<{ data: { id: string; text: string } }>
// POST /x/tweet — publishes to connected X account

api.schedulePost(content: string, scheduled_at: string): Promise<{ success: boolean; post: ScheduledApiPost }>
// POST /api/posts/schedule — schedules a single post

api.scheduleBulkPosts(
  posts: { content: string }[],
  start_time: string,
  frequency_hours: number
): Promise<{ success: boolean; posts: ScheduledApiPost[] }>
// POST /api/posts/schedule/bulk — bulk schedules with automatic time spacing

api.getScheduledPosts(): Promise<{ success: boolean; posts: ScheduledApiPost[] }>
// GET /api/posts/scheduled

api.updateScheduledPost(id: string, body: { content?: string; scheduled_at?: string }): Promise<{ success: boolean; post: ScheduledApiPost }>
// PATCH /api/posts/scheduled/:id

api.cancelScheduledPost(id: string): Promise<{ success: boolean; message: string }>
// DELETE /api/posts/scheduled/:id

api.getUserPlan(): Promise<{
  plan: "creator" | "builder" | "authority";
  postsPerDay: number;
  scheduleDaysAhead: number;
  usedToday: number;
  remainingToday: number;
  hasActiveSubscription: boolean;
  planExpiresAt: string | null;
}>
// GET /api/user/plan

api.updateUserPlan(plan: "creator" | "builder" | "authority"): Promise<{ success: boolean; plan: string }>
// PATCH /api/user/plan — for downgrading to creator (free)

api.checkout(planId: "creator" | "builder" | "authority"): Promise<{ checkoutUrl: string }>
// POST /api/checkout — get Polar.sh checkout URL; redirect browser to checkoutUrl

api.getBillingPortal(): Promise<{ portalUrl: string }>
// GET /api/portal — returns 400 if no active subscription

api.getGenerationStatus(dates: string[]): Promise<{
  success: boolean;
  dates: { date: string; used: number; limit: number; remaining: number; withinWindow: boolean; }[];
}>
// GET /api/generation-status?dates[]=... — per-date usage for ScheduleDatePicker
```

---

### `src/lib/utils.ts`

**What this file is for:** Provides the `cn()` utility function for safely composing Tailwind CSS class strings.

```typescript
export function cn(...inputs: ClassValue[]): string
// Merges class names. Uses clsx for conditional logic, then tailwind-merge
// to resolve conflicts (e.g. "p-2 p-4" → "p-4").
// Always use this instead of string concatenation for Tailwind classes.
```

**Called by:** Nearly every component that uses conditional Tailwind classes.

---

### `src/lib/niches.ts`

**What this file is for:** The static list of content niches and their focus areas. This is the source of truth for what appears in the onboarding wizard and the GeneratePanel.

```typescript
export interface Niche {
  name: string;
  focusAreas: string[];
}

export const FIXED_NICHES: Niche[]
// 7 niches, each with 20-23 focus areas:
// 1. "Content Marketing"  (21 focus areas)
// 2. "SEO"               (22 focus areas)
// 3. "X / Twitter Growth" (23 focus areas)
// 4. "Reddit Marketing"   (21 focus areas)
// 5. "Email Marketing"    (22 focus areas)
// 6. "Lead Generation"    (20 focus areas)
// 7. "Sales / Outreach"   (21 focus areas)
```

**Called by:** `src/app/startup/page.tsx`, `src/components/GeneratePanel.tsx`

---

### `src/hooks/useAuth.ts`

**What this file is for:** Fetches the currently authenticated user from the backend. Used by all pages that need to know who is logged in.

```typescript
export function useAuth(): {
  user: AuthUser | null;
  loading: boolean;        // true while the API call is in flight
  loggedIn: boolean;       // shorthand for !!user
}
// Calls api.getMe() once on mount.
// On 401 or any error, sets user to null (not logged in).
```

**Called by:** `useProtectedRoute.ts`, landing page navbar.

---

### `src/hooks/useProtectedRoute.ts`

**What this file is for:** Guards authenticated pages. Automatically redirects to `/signin` if the user is not logged in. Returns `isReady: true` only when auth check is complete and user exists.

```typescript
export function useProtectedRoute(): {
  user: AuthUser | null;
  loading: boolean;
  isReady: boolean;   // true only when: loaded AND user exists
}
// Usage in a page:
//   const { user, isReady } = useProtectedRoute();
//   if (!isReady) return <LoadingSpinner />;
```

**Called by:** `src/app/dashboard/page.tsx`, `src/app/archive/page.tsx`, `src/app/startup/page.tsx`

---

### `src/components/Providers.tsx`

**What this file is for:** The React context provider wrapper mounted at the root. Sets up TanStack Query and the Sonner toast system with project-specific styling.

```typescript
export function Providers({ children }: { children: React.ReactNode }): JSX.Element
// QueryClient config: staleTime = 5 min, retry = 1
// Toaster config: position "top-center", dark theme, bg #0B0F19, border #1F2933
```

**Imported by:** `src/app/layout.tsx`

---

### `src/app/layout.tsx`

**What this file is for:** The Next.js root layout. Applies font CSS variables to `<body>` and wraps all pages with `<Providers>`.

- Applies `geist.variable`, `ibmPlexSerif.variable`, `kumbhSans.variable` as class names on `<body>`
- Sets global metadata (title, description)
- Wraps children with `<Providers>`

---

### `src/app/fonts.ts`

**What this file is for:** Loads the three project fonts from Google Fonts via `next/font/google`.

```typescript
export const geist: NextFont          // --font-geist; weights 300-700
export const ibmPlexSerif: NextFont   // --font-ibm-plex-serif; weights 400-700, normal+italic
export const kumbhSans: NextFont      // --font-kumbh-sans; weights 300-700
```

Use via CSS utility classes: `.font-geist`, `.font-ibm-plex-serif`, `.font-kumbh-sans` (defined in `globals.css`).

---

### `src/app/dashboard/page.tsx`

**What this file is for:** The main application page. Manages all post state, fetches and merges data from two API endpoints, and coordinates all the dashboard modals and panels.

**Key state:**
```typescript
posts: Post[]                    // merged CRUD + scheduled posts — source of truth for UI
selectedPost: Post | null        // post open in EditScheduleModal
detailPost: Post | null          // post open in PostDetailPopup
sidebarOpen: boolean             // mobile sidebar toggle
showGeneratePanel: boolean       // GeneratePanel slide-over visibility
isGenerating: boolean            // generation in-progress flag
userProfile: UserProfile | null  // niche/audience info for GeneratePanel
showConnectXModal: boolean       // ConnectXModal visibility
dayPopupDate: Date | null        // date selected in DayPostsPopup
planData: { plan, postsPerDay, scheduleDaysAhead, usedToday, hasActiveSubscription } | null
showPlanModal: boolean           // PlanSwitcherModal visibility
xConnected: boolean | null       // X account connection status
```

**Data loading on mount (fires when `isReady` is true):**
```typescript
Promise.allSettled([api.getPosts(), api.getScheduledPosts()])
  → merge into Post[] via scheduledPostId lookup
api.getUserPlan()   → sets planData
api.getProfile()    → sets userProfile (404 → redirect to /startup)
api.checkXStatus()  → sets xConnected
```

**Post-upgrade polling:** When URL has `?upgrade=success`, polls `api.getUserPlan()` every 3 seconds until the plan changes, then reloads.

**Sub-components rendered:**
- `<DashboardSidebar>` — left nav
- `<CalendarCard>` — calendar grid
- `<GeneratePanel>` — slide-over generation UI
- `<PostDetailPopup>` — post detail/edit
- `<DayPostsPopup>` — day view popup
- `<EditScheduleModal>` — full-screen schedule editor
- `<OnboardingPostsModal>` — post-onboarding schedule flow
- `<ConnectXModal>` — X connection prompt
- `<PlanSwitcherModal>` — plan management

---

### `src/app/startup/page.tsx`

**What this file is for:** The onboarding wizard for new users. Collects niche, focus area, audience, and product info, then triggers AI content generation.

**Local `FormData` type:**
```typescript
type FormData = {
  problem: string;      // → userNiche in API
  audience: string;     // → targetAudience in API
  nicheArea: string;    // → focusArea in API
  hasProduct: "yes" | "no" | null;
  productDoes: string;  // → productDescription
  productFor: string;   // → productAudience
  productHelps: string; // → productSolution
};
```

**Step flow:**
- Step 0, SubStep 0 → Select niche from `FIXED_NICHES`
- Step 0, SubStep 1 → Select focus area for chosen niche
- Step 1 → Select target audience (from `AUDIENCE_OPTIONS` + "Other" free text)
- Step 2 → "Do you have a product?" yes/no
- Step 3 → (if yes) Product details (name, for whom, how it helps)
- Step 4 → Preview & generate (calls `handleGenerate`)

**`handleGenerate()`:** Calls `api.saveProfile()` → `api.generateContentStrategy()` → `api.generatePosts({ count: 10 })` → redirects to `/dashboard?schedule=true`.

---

### `src/app/archive/page.tsx`

**What this file is for:** Displays previously published posts. Currently uses static sample data (12 posts from January 2025). Supports month navigation and opens `EditScheduleModal` for re-editing.

**Helpers exported locally:**
- `makeArchivePosts(): Post[]` — returns the 12 sample archive posts
- `shortDate(date: Date): string` — e.g. "Jan 12"
- `longDateLabel(date: Date): string` — e.g. "January 12"

---

### `src/app/signin/page.tsx` and `src/app/signup/page.tsx`

**What these are for:** OAuth entry points. Both pages have the same two buttons. Both redirect the browser to `${API}/auth/google` or `${API}/auth/x` respectively. The backend handles OAuth and sets the auth cookie, then redirects back to `/dashboard`.

No form validation — purely OAuth redirects.

---

### `src/app/pricing/page.tsx` and `src/app/pricing/PricingPageContent.tsx`

**What these are for:** The pricing page. `page.tsx` is the layout shell; `PricingPageContent.tsx` renders the three plan cards and handles checkout.

```typescript
// PricingPageContent.tsx
export function PricingPageContent(): JSX.Element
// Renders 3 PricingCards (Creator, Builder, Authority)
// handleCheckout(planId): calls api.checkout(planId), redirects to checkoutUrl
// Builder plan is highlighted (gradient card)
```

**Plans rendered:**
| Plan | Original | Current | Features |
|------|----------|---------|---------|
| Creator | $39/mo | $19/mo | 4 posts/day, 3 days ahead |
| Builder | $59/mo | $39/mo | 7 posts/day, 7 days ahead, long form, priority support |
| Authority | $79/mo | $59/mo | 12 posts/day, 14 days ahead, priority support |

---

### `src/components/GeneratePanel.tsx`

**What this file is for:** The slide-over panel where users choose what content to generate. It fetches plan limits and per-date usage, then calls the parent's `onGenerate` handler.

```typescript
interface GeneratePanelProps {
  isOpen: boolean;
  onClose: () => void;
  userNiche: string;                  // pre-selects user's saved niche
  isGenerating?: boolean;             // shows spinner during generation
  targetDate?: Date;                  // pre-selects a date
  onGenerate: (params: {
    niche: string;
    focusArea: string;
    slideCount: number;
    scheduledFor: Date;
  }) => Promise<void>;
}

export function GeneratePanel(props: GeneratePanelProps): JSX.Element
```

**Internal types:**
```typescript
type PlanKey = "creator" | "builder" | "authority";

interface PlanData {
  plan: PlanKey;
  postsPerDay: number;
  scheduleDaysAhead: number;
  usedToday: number;
  remainingToday: number;
}

interface DateUsage {
  used: number;
  limit: number;
  withinWindow: boolean;
}
```

**Key behaviors:**
- Shows user's niche with a "your niche" badge; allows switching to any niche
- Focus areas: shows 4 by default, "View all" reveals full list
- Count selector: 1-15, with preset buttons (4, 7, 12)
- On 403 error from generation: shows inline daily limit error (not toast)
- Responsive: slide-over from right on desktop (≥768px), centered modal on mobile

**Sub-components used:** `PlanUsageBar`, `ScheduleDatePicker`

---

### `src/components/PlanUsageBar.tsx`

**What this file is for:** A simple progress bar showing how many posts have been used vs. the plan limit today.

```typescript
interface PlanUsageBarProps {
  used: number;
  limit: number;
  planName: string;   // e.g. "Creator"
}

export function PlanUsageBar(props: PlanUsageBarProps): JSX.Element
// Bar fills purple (#9d8ee8), turns amber (#f59e0b) when limit reached
// Shows "X of Y posts used today" or "Limit reached — upgrade to generate more today"
```

---

### `src/components/UpgradePrompt.tsx`

**What this file is for:** An inline upgrade CTA block shown inside `ScheduleDatePicker` when a date is outside the user's scheduling window. Triggers Polar checkout on click.

```typescript
interface UpgradePromptProps {
  planName: string;             // current plan display name e.g. "Creator"
  nextScheduleDays: number;     // days ahead available after upgrade
  nextPostsPerDay: number;      // posts/day available after upgrade
  planId: "builder" | "authority";  // which plan to upgrade to
}

export function UpgradePrompt(props: UpgradePromptProps): JSX.Element
// handleUpgrade(): calls api.checkout(planId), redirects to checkoutUrl
```

---

### `src/components/ScheduleDatePicker.tsx`

**What this file is for:** A row of date buttons (today + next N days) that shows capacity per date and locks dates outside the plan's scheduling window.

```typescript
interface ScheduleDatePickerProps {
  scheduleDaysAhead: number;    // from plan (3, 7, or 14)
  postsPerDay: number;          // plan limit — used for capacity coloring
  planName: string;             // "Creator" | "Builder" | "Authority"
  onDateSelect: (date: Date) => void;
  usageByDate: Record<string, DateUsage>;  // keyed by YYYY-MM-DD
  selectedDate: Date;
}

export function ScheduleDatePicker(props: ScheduleDatePickerProps): JSX.Element
```

**Date states:**
- Selected: blue ring
- Today: purple tint
- Partial usage: yellow dot
- Full (used >= limit): amber background + lock icon
- Out of window: gray + lock icon → clicking shows `<UpgradePrompt>`

**`NEXT_TIER` map** (internal): Creator → Builder, Builder → Authority, Authority → null.

---

### `src/components/modules/EditScheduleModal.tsx`

**What this file is for:** A full-screen modal for editing and scheduling posts. Also exports the canonical `Post` type, `dayKey()` helper, and calendar utilities used throughout the app.

**Exports:**
```typescript
export type Post = {
  id: string;
  content: string;
  platform: "Twitter";
  status: "draft" | "scheduled" | "posted";
  scheduledDate?: Date;
  scheduledPostId?: string;   // links to ScheduledApiPost._id
  targetDate?: Date;           // calendar day this post was generated for
};

export const FREQUENCIES: { label: string; minutes: number }[]
// Options: 5min, 15min, 30min, 1hr, 2hr, 6hr, 1day

export const CAL_HEADERS: string[]
// ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function timeToHHMM(date: Date): string     // "14:30"
export function ordinal(n: number): string          // 1 → "1st", 2 → "2nd"
export function ordinalDate(d: Date): string        // "12th Jan"
export function dayKey(date: Date): string          // "2025-01-12"

export function MiniCalendar({
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}): JSX.Element

export function EditScheduleModal({
  posts: Post[];
  onClose: () => void;
  onSave: (updatedPosts: Post[]) => void;
}): JSX.Element
```

**Layout:** 3-panel layout — left: post list, center: text editor, right: mini calendar + scheduler.

---

### `src/components/modules/CalendarCard.tsx`

**What this file is for:** The main calendar UI on the dashboard. Shows posts grouped by day in a monthly grid with week tabs.

```typescript
interface CalendarCardProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onBulkSchedule: (scheduledPosts: Post[]) => void;
  onGenerateClick: (day: Date) => void;
  onDayClick: (day: Date, posts: Post[]) => void;
}

export function CalendarCard(props: CalendarCardProps): JSX.Element
```

**Internal helpers:**
```typescript
function getWeekDays(month: Date, weekNumber: number): Date[]
function getWeekNumberForDate(date: Date): number
function formatTime(date: Date): string
```

**Features:** Month/week navigation, 4 week tabs per month, dots on days with posts, side panel showing selected day's posts, auto-schedule popover on mobile.

---

### `src/components/modules/PostDetailPopup.tsx`

**What this file is for:** Full post detail view with inline editing, schedule picker, and action buttons (post now, unschedule, delete).

```typescript
interface PostDetailPopupProps {
  post: Post;
  user: AuthUser | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onUnschedule: (id: string) => void;
  onPostNow: (id: string) => void;
  onContentSave: (id: string, content: string) => void;
  onSchedule: (id: string, date: Date, content: string) => void;
  onBack?: () => void;
}

export function PostDetailPopup(props: PostDetailPopupProps): JSX.Element
```

**Responsive:** Modal (centered) on desktop, bottom sheet on mobile. Uses Framer Motion for animations.

**Local helpers:**
```typescript
function formatHeaderDate(date: Date): string   // "Mon, Jan 12 · 2:30 PM"
function formatScheduleDate(date: Date): string // "Monday, January 12, 2025 at 2:30 PM"
function getHandle(user: AuthUser | null): string  // "@name_surname"
function getInitial(user: AuthUser | null): string // "J"
```

---

### `src/components/modules/DayPostsPopup.tsx`

**What this file is for:** Shows all posts for a selected calendar day. Desktop: floating modal. Mobile: bottom sheet.

```typescript
interface DayPostsPopupProps {
  day: Date;
  posts: Post[];
  user: AuthUser | null;
  onClose: () => void;
  onPostClick: (post: Post) => void;
  onGenerateClick: () => void;
}

export function DayPostsPopup(props: DayPostsPopupProps): JSX.Element
```

Uses a shared `DayPostsContent` inner component for both the desktop and mobile layouts.

---

### `src/components/modules/OnboardingPostsModal.tsx`

**What this file is for:** Full-screen modal shown after the onboarding wizard generates the first batch of posts. Users can review, edit, delete, and schedule all posts at once.

```typescript
interface OnboardingPostsModalProps {
  posts: Post[];
  user: AuthUser | null;
  onClose: () => void;
  onScheduleAll: (posts: Post[]) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}

export function OnboardingPostsModal(props: OnboardingPostsModalProps): JSX.Element
```

**Sub-component `TweetCard`:** Editable tweet preview with auto-resizing textarea. Saves on blur via `onUpdate`.

---

### `src/components/modules/AutoSchedulePopover.tsx`

**What this file is for:** A popover (or mobile bottom sheet) for bulk-scheduling posts with a configurable start date, start time, and posting frequency.

```typescript
interface AutoSchedulePopoverProps {
  posts: Post[];
  onClose: () => void;
  onConfirm: (scheduledPosts: Post[]) => void;
  isMobileSheet?: boolean;   // true = renders as bottom sheet, false = popover
}

export function AutoSchedulePopover(props: AutoSchedulePopoverProps): JSX.Element
```

Uses `FREQUENCIES` from `EditScheduleModal.tsx` and `MiniCalendar` from `EditScheduleModal.tsx`.

---

### `src/components/modules/ConnectXModal.tsx`

**What this file is for:** A simple modal prompting users to connect their X account. On confirm, redirects to `${BASE}/auth/x`.

```typescript
interface ConnectXModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectXModal(props: ConnectXModalProps): JSX.Element
// handleConnect(): window.location.href = `${BASE}/auth/x`
```

---

### `src/components/modules/PlanSwitcherModal.tsx`

**What this file is for:** A plan comparison + management modal. Shows all three plans with their features, handles downgrades (direct) and upgrades (via Polar checkout), and links to the billing portal.

```typescript
type PlanKey = "creator" | "builder" | "authority";

interface PlanSwitcherModalProps {
  currentPlan: PlanKey;
  hasActiveSubscription: boolean;
  onClose: () => void;
  onPlanChange: () => void;       // called after successful plan switch
}

export function PlanSwitcherModal(props: PlanSwitcherModalProps): JSX.Element
```

**`PLANS` constant (internal):**
```typescript
const PLANS = [
  { key: "creator",   name: "Creator",   postsPerDay: 4,  scheduleDays: 3,  features: [...] },
  { key: "builder",   name: "Builder",   postsPerDay: 7,  scheduleDays: 7,  features: [...] },
  { key: "authority", name: "Authority", postsPerDay: 12, scheduleDays: 14, features: [...] },
];
```

---

### `src/components/modules/DashboardSidebar.tsx`

**What this file is for:** Left sidebar with navigation links. Fixed on desktop, slide-in on mobile.

```typescript
export function DashboardSidebar({
  mobileOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}): JSX.Element
```

**Sub-component `NavItem`:**
```typescript
function NavItem({ icon: React.ReactNode; label: string; href?: string }): JSX.Element
// Active state detected via usePathname() === href
```

**Routes:** Dashboard (`/dashboard`), Archive (`/archive`), Settings (button only, no route yet).

---

### `src/components/ui/buttons/gradientButton.tsx`

**What this file is for:** Primary CTA button with solid gradient fill.

```typescript
type GradientButtonProps = {
  buttonLabel?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export function GradientButton(props: GradientButtonProps): JSX.Element
// gradient: linear-gradient(109.69deg, #E36A3A 11.2%, #B44BD6 49.66%, #5C3FED 88.12%)
// shadow: 5px 5px 7.4px 0px #1E103538
// hover shadow: 7px 7px 10px 0px #1E103560
```

---

### `src/components/ui/buttons/gradientBorderButton.tsx`

**What this file is for:** Button with gradient border and dark inner fill (used in Navbar and highlighted PricingCard).

```typescript
type GradientBorderButtonProps = {
  buttonLabel?: string;
  className?: string;       // applied to outer wrapper div
  innerClassName?: string;  // applied to inner button div
  onClick?: () => void;
  disabled?: boolean;
};

export function GradientBorderButton(props: GradientBorderButtonProps): JSX.Element
// outer: bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED] p-0.5 rounded-[4px]
// inner: bg-[#0F1419] hover:bg-[#151B22]
```

---

### `src/components/ui/pricingButton.tsx`

**What this file is for:** The "Select Plan" button for non-highlighted pricing cards. Dark background, no gradient.

```typescript
type SolidButtonProps = {
  label?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function SolidButton(props: SolidButtonProps): JSX.Element
// bg: #1F2933, hover: #263241
// shadow: 0 4px 12px rgba(0,0,0,0.25)
```

---

### `src/components/ui/pricingCard.tsx`

**What this file is for:** A pricing plan card showing title, price (with optional strikethrough), features list, and CTA button.

```typescript
type PricingCardProps = {
  badgeText?: string;        // default: "No credit card required" (currently hidden)
  title: string;
  originalPrice?: string;    // shown with line-through
  currentPrice: string;
  priceNote?: string;        // "First 50 users only" note
  features: string[];
  ctaLabel?: string;         // default: "Select Plan"
  highlighted?: boolean;     // true = gradient bg + GradientBorderButton CTA
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
};

export function PricingCard(props: PricingCardProps): JSX.Element
```

---

### `src/components/ui/LoadingSpinner.tsx`

**What this file is for:** Full-screen loading state used by auth-guarded pages while auth check is in flight.

```typescript
export function LoadingSpinner(): JSX.Element
// Full-screen bg-[#0F1419], centered spinning circle
// border-[#5C3FED] border-t-transparent animate-spin
```

---

## 6. KEY WORKFLOWS

### 1. User Signs In

**Plain English:** User clicks "Log In With Google" → browser redirects to the backend OAuth handler → backend sets httpOnly cookie → redirects to `/dashboard` → dashboard calls `/auth/me` to confirm identity.

```
signin/page.tsx: button onClick
  → window.location.href = `${API}/auth/google`
    → [Backend: OAuth handshake, cookie set]
      → redirect to /dashboard
        → useProtectedRoute() → useAuth()
          → api.getMe() → { _id, name, email, avatar }
            → isReady = true → page renders
```

---

### 2. First-Time User Onboarding

**Plain English:** A user with no profile is detected on the dashboard and sent to `/startup`. They fill in a 4-step wizard, hit "Generate", and are redirected back to the dashboard with their first batch of posts ready to schedule.

```
dashboard/page.tsx: api.getProfile() → 404 error
  → router.push("/startup")
    → startup/page.tsx: user fills steps 0-4
      → handleGenerate()
        → api.saveProfile({ userNiche, targetAudience, focusArea, ... })
        → api.generateContentStrategy()
        → api.generatePosts({ count: 10 })
          → router.push("/dashboard?schedule=true")
            → dashboard: fromOnboarding = true
              → setShowOnboardingModal(true) → OnboardingPostsModal renders
                → user reviews posts → "Schedule All"
                  → api.scheduleBulkPosts(posts, start_time, frequency_hours)
```

---

### 3. Generating More Posts (Dashboard)

**Plain English:** User opens the GeneratePanel, picks niche/focus/count/date, clicks Generate. Posts are added to state.

```
dashboard/page.tsx: setShowGeneratePanel(true)
  → GeneratePanel renders (slide-over from right)
    → user selects niche, focus area, count, date
    → GeneratePanel calls props.onGenerate({ niche, focusArea, slideCount, scheduledFor })
      → dashboard.handleGenerate() (defined in page.tsx)
        → api.generatePost({ niche, focusAreas: [focusArea], count, scheduledFor: ISO string })
          → 403: GeneratePanel shows inline error ("daily limit reached")
          → 200: new posts added to posts[] state via setPosts([...posts, ...newPosts])
```

---

### 4. Scheduling a Single Post

**Plain English:** User opens a post detail, picks a date/time, and hits "Schedule". The post is sent to the backend scheduler.

```
PostDetailPopup: props.onSchedule(id, date, content)
  → dashboard.page.tsx: handleSchedule()
    → api.updatePost(id, { finalPost: content })
    → api.schedulePost(content, scheduled_at)
      → returns ScheduledApiPost
        → api.updatePost(id, { meta: { scheduledPostId: scheduledPost._id } })
          → setPosts: update local post status to "scheduled" + scheduledDate
```

---

### 5. Bulk Auto-Scheduling Posts

**Plain English:** From the calendar, user selects unscheduled posts, opens AutoSchedulePopover, picks start time and frequency, and confirms. Posts are scheduled in one API call.

```
CalendarCard: auto-schedule button
  → AutoSchedulePopover renders
    → user sets start date, start time, frequency
    → onConfirm(scheduledPosts: Post[])
      → dashboard.page.tsx: handleBulkSchedule()
        → api.scheduleBulkPosts(
            posts: [{ content }],
            start_time: ISO string,
            frequency_hours: number
          )
          → returns ScheduledApiPost[]
            → update each CRUD post meta with scheduledPostId
              → refresh posts[] state
```

---

### 6. Publishing Directly to X

**Plain English:** User clicks "Post Now" on any scheduled/draft post. The content is sent to X immediately via the backend.

```
PostDetailPopup: props.onPostNow(id)
  → dashboard.page.tsx: handlePostNow(id)
    → find post in posts[] state
    → api.postTweet(post.content)
      → { data: { id, text } }
        → toast.success("Posted to X!")
        → setPosts: update post status to "posted"
```

---

### 7. Plan Upgrade via Polar

**Plain English:** User clicks "Upgrade" in the ScheduleDatePicker or PlanSwitcherModal. They're redirected to Polar.sh to pay. On return, the frontend polls until the new plan is reflected.

```
UpgradePrompt / PlanSwitcherModal: handleUpgrade()
  → api.checkout(planId)
    → { checkoutUrl }
      → window.location.href = checkoutUrl
        → [Polar.sh payment]
          → redirect to /dashboard?upgrade=success
            → dashboard: polls api.getUserPlan() every 3 seconds
              → plan changes → planData updated → polling stops → page reloads
```

---

## 7. DATA MODELS

### `AuthUser` (from `src/lib/api.ts`)
Represents the logged-in user.
```typescript
type AuthUser = {
  _id: string;      // MongoDB ObjectId string
  name: string;     // display name
  email: string;    // email address
  avatar?: string;  // profile image URL (from pbs.twimg.com or lh3.googleusercontent.com)
};
```
Note: The backend `/auth/me` route returns `displayName` as `name` and `photo` as `avatar`. The frontend type assumes the backend remaps these.

---

### `UserProfile` (from `src/lib/api.ts`)
The user's content preferences, set during onboarding.
```typescript
type UserProfile = {
  userId: string;        // references AuthUser._id
  userNiche: string;     // e.g. "SEO"
  targetAudience: string; // e.g. "Startup founders"
  focusArea: string;     // e.g. "Keyword Research"
  productName?: string;  // optional product name
  createdAt: string;     // ISO datetime
};
```

---

### `UserProfilePayload` (from `src/lib/api.ts`)
The shape sent to `POST /profile`.
```typescript
type UserProfilePayload = {
  userNiche: string;
  targetAudience: string;
  focusArea: string;
  productName?: string;
  productDescription?: string;  // "what your product does"
  productAudience?: string;     // "who it's for"
  productSolution?: string;     // "how it helps them"
};
```

---

### `ApiPost` (from `src/lib/api.ts`)
Raw post shape from the backend.
```typescript
type ApiPost = {
  _id: string;
  finalPost: string;                     // THE post text — use this field, not 'post'
  status?: string;
  scheduledDate?: string;               // ISO datetime
  targetDate?: string;                  // ISO datetime — calendar day post belongs to
  meta?: Record<string, unknown>;       // meta.scheduledPostId: string links to ScheduledApiPost
};
```

---

### `ScheduledApiPost` (from `src/lib/api.ts`)
A time-based publishing job.
```typescript
type ScheduledApiPost = {
  _id: string;
  content: string;
  status: "pending" | "posted" | "failed" | "cancelled";
  scheduledAt: string;       // when it's set to fire
  postedAt: string | null;   // when it actually fired
  batchId: string | null;    // groups bulk-scheduled posts
  platform: string;          // e.g. "twitter"
};
```

---

### `Post` (from `src/components/modules/EditScheduleModal.tsx`)
The canonical frontend post shape. Used everywhere in the UI.
```typescript
type Post = {
  id: string;               // = ApiPost._id
  content: string;          // = ApiPost.finalPost
  platform: "Twitter";      // always "Twitter" — LinkedIn/Facebook not integrated
  status: "draft" | "scheduled" | "posted";
  scheduledDate?: Date;     // Date object of when it fires / should fire
  scheduledPostId?: string; // = ScheduledApiPost._id (if linked)
  targetDate?: Date;        // calendar day this post belongs to (for grouping)
};
```

---

### Plan Data (from `api.getUserPlan()` response)
```typescript
{
  plan: "creator" | "builder" | "authority";
  postsPerDay: number;        // 4 / 7 / 12
  scheduleDaysAhead: number;  // 3 / 7 / 14
  usedToday: number;          // posts generated today
  remainingToday: number;     // postsPerDay - usedToday
  hasActiveSubscription: boolean;
  planExpiresAt: string | null;
}
```

---

## 8. SHARED UTILITIES & HELPERS

### `cn(...inputs: ClassValue[]): string` — `src/lib/utils.ts`
Merge Tailwind CSS class names safely. Handles conflicts (last one wins), conditionals, arrays.
```typescript
cn("p-2 text-white", isActive && "bg-blue-500", className)
// → "p-2 text-white bg-blue-500 [className]" (conflicts resolved)
```
**When to use:** Any time you have conditional or dynamic Tailwind classes. Never use string concatenation instead.

---

### `apiFetch<T>(path, init?): Promise<T>` — `src/lib/api.ts`
Low-level fetch wrapper. Handles base URL, auth cookies, JSON headers, and error parsing.
```typescript
// Direct usage (rare — prefer api.* methods):
const data = await apiFetch<MyType>("/my-endpoint", {
  method: "POST",
  body: JSON.stringify({ key: "value" }),
});
// On non-2xx: throws Error with .status property set
```

---

### `FIXED_NICHES: Niche[]` — `src/lib/niches.ts`
Static list of 7 niches with their focus areas. Import to populate niche/focus pickers.
```typescript
import { FIXED_NICHES } from "@/lib/niches";

const niche = FIXED_NICHES.find(n => n.name === "SEO");
const focuses = niche?.focusAreas; // string[]
```

---

### `useAuth(): { user, loading, loggedIn }` — `src/hooks/useAuth.ts`
Reads auth state. Use this on pages that need the current user but don't need to guard access.

---

### `useProtectedRoute(): { user, loading, isReady }` — `src/hooks/useProtectedRoute.ts`
Auth guard for protected pages. Redirects to `/signin` if not logged in.
```typescript
// Standard pattern for all protected pages:
const { user, isReady } = useProtectedRoute();
if (!isReady) return <LoadingSpinner />;
// ... rest of page
```

---

### `dayKey(date: Date): string` — `src/components/modules/EditScheduleModal.tsx`
Returns `"YYYY-MM-DD"` string from a Date object. Used as a stable map key for grouping posts by calendar day.
```typescript
import { dayKey } from "@/components/modules/EditScheduleModal";
const key = dayKey(new Date()); // "2025-01-12"
```

---

## 9. CONVENTIONS & PATTERNS

### Adding a New Page

1. Create `src/app/[route]/page.tsx`
2. If the page requires auth, add `useProtectedRoute()` at the top:
   ```typescript
   "use client";
   import { useProtectedRoute } from "@/hooks/useProtectedRoute";
   import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

   export default function MyPage() {
     const { user, isReady } = useProtectedRoute();
     if (!isReady) return <LoadingSpinner />;
     // page content
   }
   ```
3. Mark `"use client"` if the page uses hooks or event handlers.
4. Server components (no interactivity) need no directive.

---

### Adding a New API Call

1. Add the type in `src/lib/api.ts` if needed.
2. Add a method to the `api` object:
   ```typescript
   myNewEndpoint: (param: string) =>
     apiFetch<MyResponseType>("/my-endpoint", {
       method: "POST",
       body: JSON.stringify({ param }),
     }),
   ```
3. Use it in components: `import { api } from "@/lib/api"; await api.myNewEndpoint(value);`

---

### Adding a New Component

1. Decide placement:
   - App-wide, no domain logic → `src/components/ui/`
   - Dashboard feature → `src/components/modules/`
   - Landing page section → `src/components/landingPage/sections/` or `newLandingPage/sections/`
2. Mark `"use client"` only if the component uses React hooks or browser APIs. Server components are the default.
3. Use `cn()` for conditional class composition:
   ```typescript
   import { cn } from "@/lib/utils";
   className={cn("base-class", isActive && "active-class", className)}
   ```
4. Use only colors, gradients, fonts, and shadows defined in `CLAUDE.md`. Never introduce new values.

---

### Styling Rules

- Always use `cn()` from `@/lib/utils` for conditional/dynamic classes.
- Use the exact hex values from the design system — never approximate with Tailwind color names (e.g. use `#5C3FED` not `purple-600`).
- Custom CSS variables for theme tokens (oklch) are in `globals.css` — use them for Radix/shadcn primitives.
- Tailwind v4: no `tailwind.config.js` — configuration lives in `globals.css`.

---

### Error Handling

- API errors: `apiFetch` throws `Error` with `.status`. Check `(err as Error & { status?: number }).status === 403` for plan limit errors.
- Toast notifications: use `toast.success()` / `toast.error()` from `sonner`.
- Plan limit in GeneratePanel: shown inline (not as toast) with a specific UI block.
- Auth failure (401): handled automatically by `useProtectedRoute` redirect.

---

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Component files | PascalCase | `PostDetailPopup.tsx` |
| Hook files | camelCase starting with `use` | `useProtectedRoute.ts` |
| Utility files | camelCase | `utils.ts`, `niches.ts` |
| Component exports | Named + default | `export function Foo()` or `export default function Page()` |
| Type aliases | PascalCase | `type Post = { ... }` |
| Interface names | PascalCase | `interface PostCardProps` |
| CSS variables | kebab-case | `--font-geist`, `--radius` |

---

## 10. THINGS TO KNOW BEFORE MAKING CHANGES

### High-Impact Files — Change Carefully

| File | Why it matters |
|------|---------------|
| `src/app/dashboard/page.tsx` | ~1003 lines. Controls ALL post state and coordinates every modal. A bug here breaks the whole dashboard. |
| `src/components/GeneratePanel.tsx` | ~900 lines. Complex state for niche/focus selection, date picking, plan checking. |
| `src/components/modules/EditScheduleModal.tsx` | Exports the canonical `Post` type and `dayKey()` helper used everywhere. Changing `Post` requires updating all consumers. |
| `src/lib/api.ts` | Every component that touches the backend depends on this. Type changes cascade everywhere. |

---

### The `Post` Type Is the Universal Currency

`Post` (from `EditScheduleModal.tsx`) is the single frontend type for posts. It is imported by: `CalendarCard`, `PostDetailPopup`, `DayPostsPopup`, `OnboardingPostsModal`, `AutoSchedulePopover`, `WeeklyOverview`, `archive/page.tsx`, and `dashboard/page.tsx`. If you change its shape, update all of these.

---

### CRUD Posts and Scheduled Posts Are Two Separate Collections

Don't confuse `ApiPost` (from `GET /posts`) with `ScheduledApiPost` (from `GET /api/posts/scheduled`). They are linked via `ApiPost.meta.scheduledPostId === ScheduledApiPost._id`. The merge logic in `dashboard/page.tsx` (lines ~70-180) reconciles them into a single `Post[]`. When updating a post's schedule, you must update BOTH: `api.updatePost(id, { meta: { scheduledPostId } })` AND `api.updateScheduledPost(scheduledPostId, { ... })`.

---

### `finalPost` Is the Post Text Field

The backend post object has several text fields (`post`, `finalPost`, `pain`, `skeleton`). **Always use `finalPost`** for displaying and editing post content. This is enforced by the `ApiPost` type.

---

### No Facebook or LinkedIn Integration

Despite `SocialMediaModal.tsx` showing those platforms as options, and `Post.platform` being typed as `"Twitter"`, only X/Twitter is actually integrated. Do not wire up Facebook or LinkedIn endpoints — the backend explicitly excludes them.

---

### `platform: "Twitter"` Is Hardcoded

All posts have `platform: "Twitter"` — this is not derived from user input. The type enforces it as a string literal. Don't generalize this without a backend change.

---

### Adding Image Domains

If you add `<Image>` components that load from a new external domain, add it to `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    new URL("https://your-new-domain.com/**"),
    // existing: pbs.twimg.com, lh3.googleusercontent.com
  ],
},
```

---

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Yes (prod) | `http://localhost:4000` | Backend REST API base URL |

The `NEXT_PUBLIC_` prefix means it's exposed to the browser bundle. Do not put secrets here.

---

### Never Edit `.next/`

The `.next/` directory is Next.js build output. It's regenerated on every build. Any changes are overwritten.

---

### Auth Cookie Is HttpOnly

The auth cookie is set by the backend and is not accessible via JavaScript (`document.cookie`). The only way to check auth status is by calling `GET /auth/me` — which is what `useAuth()` does.

---

### Creator Plan Is Free

The `creator` plan is the default. New users get it automatically. Only `builder` and `authority` require Polar checkout. When `api.checkout("creator")` is called, the behavior depends on the backend implementation — check `BACKEND.md` before using it.

---

### Polar Upgrade Return Flow

After a successful Polar checkout, the backend redirects to `/dashboard?upgrade=success`. The dashboard detects this URL parameter and polls `api.getUserPlan()` every 3 seconds until the plan value changes. This polling is in `dashboard/page.tsx`. Don't remove it — without it, the UI won't reflect the upgraded plan after payment.

---

### Archive Page Uses Static Data

`src/app/archive/page.tsx` renders static sample posts (hardcoded in `makeArchivePosts()`). It is not yet wired to the real `GET /posts` endpoint filtered by `status: "posted"`. This is intentional placeholder behavior.

---

### Tailwind v4 Has No Config File

Tailwind CSS v4 is configured via CSS, not `tailwind.config.js`. All custom theme values (colors, fonts, radius variables) live in `src/app/globals.css`. Do not create a `tailwind.config.js` file.

export const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const AUTH_TOKEN_KEY = "auth_token";

export type PlanKey = "creator" | "builder" | "authority";

export type TrialAccessState = "active_trial" | "paid" | "trial_expired";

export type TrialPaywallPayload = {
  reason?: "plan_selection_required" | "trial_expired";
  requiresPayment?: boolean;
  requiresPlanSelection?: boolean;
  availablePlanIds?: PlanKey[];
  selectedPlanId?: PlanKey;
  checkoutUrl?: string;
  trialExpiresAt?: string | null;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  paywall?: TrialPaywallPayload;

  constructor(
    message: string,
    options: { status?: number; code?: string; paywall?: TrialPaywallPayload } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.paywall = options.paywall;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isTrialExpiredError(error: unknown): error is ApiError {
  return (
    isApiError(error) &&
    error.status === 402 &&
    error.code === "TRIAL_EXPIRED"
  );
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

const BASE_OPTS: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${BASE}${path}`, {
    ...BASE_OPTS,
    ...init,
    headers: { ...BASE_OPTS.headers, ...authHeader, ...(init.headers ?? {}) },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = res.statusText;
    let code: string | undefined;
    let paywall: TrialPaywallPayload | undefined;

    try {
      const parsed = JSON.parse(body) as {
        error?: string;
        message?: string;
        paywall?: TrialPaywallPayload;
      };
      message = parsed.message ?? parsed.error ?? res.statusText;
      code = parsed.error;
      paywall = parsed.paywall;
    } catch {
      // Ignore parse errors and fall back to status text.
    }

    throw new ApiError(message, { status: res.status, code, paywall });
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ------------------------------------------------------------------ //
//  Types                                                               //
// ------------------------------------------------------------------ //

/** Returned by GET /auth/me */
export type AuthUser = {
  _id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  photo?: string;
  trial_expires_at?: string | null;
  is_paid?: boolean;
  plan?: PlanKey;
  polarCustomerId?: string | null;
};

/** Fields for POST /profile */
export type UserProfilePayload = {
  userNiche: string;
  targetAudience?: string;
  focusArea: string;
  productName?: string;
  productDescription?: string;
  productAudience?: string;
  productSolution?: string;
};

/** Returned by GET /profile */
export type UserProfile = {
  _id?: string;
  userId: string;
  userNiche: string;
  targetAudience?: string;
  focusArea: string;
  productName?: string;
  createdAt: string;
};

type GetProfileResponse = {
  success: boolean;
  profile: UserProfile;
};

/** Returned by GET /posts */
export type ApiPost = {
  _id: string;
  id?: string;
  finalPost: string;
  status?: string;
  scheduledDate?: string;
  targetDate?: string;
  meta?: Record<string, unknown>;
};

/** Returned by GET /api/posts/scheduled and POST /api/posts/schedule */
export type ScheduledApiPost = {
  _id: string;
  content: string;
  status: "pending" | "posted" | "failed" | "cancelled";
  scheduledAt: string;
  postedAt: string | null;
  batchId: string | null;
  platform: string;
  mediaUrls?: string[];
};

export type UserPlan = {
  plan: PlanKey;
  postsPerDay: number;
  scheduleDaysAhead: number;
  usedToday: number;
  remainingToday: number;
  hasActiveSubscription: boolean;
  planExpiresAt: string | null;
  isPaid: boolean;
  trialExpiresAt: string | null;
};

export type TrialAccessStatus = UserPlan & {
  accessState: TrialAccessState;
  hasAccess: boolean;
};

export function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    name: user.name ?? user.displayName ?? "",
    avatar: user.avatar ?? user.photo,
  };
}

export function deriveTrialAccessStatus(plan: UserPlan): TrialAccessStatus {
  const trialExpiresAtMs = plan.trialExpiresAt
    ? new Date(plan.trialExpiresAt).getTime()
    : null;
  const isTrialActive =
    !plan.isPaid &&
    trialExpiresAtMs !== null &&
    Number.isFinite(trialExpiresAtMs) &&
    trialExpiresAtMs > Date.now();

  const accessState: TrialAccessState = plan.isPaid
    ? "paid"
    : isTrialActive
    ? "active_trial"
    : "trial_expired";

  return {
    ...plan,
    accessState,
    hasAccess: accessState !== "trial_expired",
  };
}

// ------------------------------------------------------------------ //
//  Named API helpers                                                   //
// ------------------------------------------------------------------ //
export const api = {
  /** Check auth — 401 means not logged in. Returns User document. */
  getMe: async () => normalizeAuthUser(await apiFetch<AuthUser>("/auth/me")),

  /** Retrieve current user's niche/audience profile */
  getProfile: async () => {
    const response = await apiFetch<GetProfileResponse>("/profile");
    return response.profile;
  },

  /** Save onboarding form data as the user's niche/audience profile */
  saveProfile: (body: UserProfilePayload) =>
    apiFetch<{ success: boolean; profile: unknown }>("/profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Generate content strategy (subtopics) */
  generateContentStrategy: () =>
    apiFetch<unknown>("/generate-content-strategy", { method: "POST" }),

  /** Generate N educational posts (randomly picks subtopics from DB) */
  generatePosts: (body: { count?: number; target_date?: string }) =>
    apiFetch<{ success: boolean; posts: unknown[] }>("/generate-subtopic-post", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Generate posts for a specific niche + focus areas (Mode B) */
  generateTargetedPosts: (body: {
    niche: string;
    focusAreas: string[];
    count: number;
    target_date?: string;
  }) =>
    apiFetch<{ success: boolean; posts: unknown[] }>("/generate-targeted-posts", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Fetch all generated posts */
  getPosts: () => apiFetch<unknown>("/posts"),

  /** Update a post's content and/or meta */
  updatePost: (id: string, fields: { finalPost?: string; meta?: Record<string, unknown> }) =>
    apiFetch<{ success: boolean; data: unknown }>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    }),

  /** Delete a post by ID */
  deletePost: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/posts/${id}`, {
      method: "DELETE",
    }),

  /** Check whether the current user has connected their X account */
  checkXStatus: () =>
    apiFetch<{ connected: boolean }>("/auth/x/status"),

  /** Post a tweet to the connected X account */
  postTweet: (text: string) =>
    apiFetch<{ data: { id: string; text: string } }>("/x/tweet", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  /** Schedule a single post for a specific date/time */
  schedulePost: (
    content: string,
    scheduled_at: string,
    options: { media_urls?: string[]; platform?: string } = {}
  ) =>
    apiFetch<{ success: boolean; post: ScheduledApiPost }>("/api/posts/schedule", {
      method: "POST",
      body: JSON.stringify({ content, scheduled_at, ...options }),
    }),

  /** Bulk-schedule multiple posts with automatic time spacing */
  scheduleBulkPosts: (
    posts: { content: string; mediaUrls?: string[]; platform?: string }[],
    start_time: string,
    frequency_hours: number
  ) =>
    apiFetch<{ success: boolean; posts: ScheduledApiPost[] }>("/api/posts/schedule/bulk", {
      method: "POST",
      body: JSON.stringify({ posts, start_time, frequency_hours }),
    }),

  /** List all scheduled posts for the current user */
  getScheduledPosts: () =>
    apiFetch<{ success: boolean; posts: ScheduledApiPost[] }>("/api/posts/scheduled"),

  /** Cancel a pending scheduled post */
  cancelScheduledPost: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/posts/scheduled/${id}`, {
      method: "DELETE",
    }),

  /** Edit content or scheduled time of a pending post */
  updateScheduledPost: (
    id: string,
    body: { content?: string; scheduled_at?: string; media_urls?: string[]; platform?: string }
  ) =>
    apiFetch<{ success: boolean; post: ScheduledApiPost }>(`/api/posts/scheduled/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  logout: () => apiFetch<void>("/auth/logout").finally(clearAuthToken),

  /** Initiate Polar checkout — returns a redirect URL to Polar's payment page */
  checkout: (planId: PlanKey) =>
    apiFetch<{ checkoutUrl: string }>("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),

  /** Get Polar billing-portal URL for existing subscribers */
  getBillingPortal: () =>
    apiFetch<{ portalUrl: string }>("/api/portal"),

  /** Sync plan immediately after returning from Polar checkout */
  syncPlan: () =>
    apiFetch<{ plan: string; synced: boolean; message?: string }>(
      "/api/user/sync-plan",
      { method: "POST" }
    ),

  /** Get the user's current plan, limits, and today's usage */
  getUserPlan: () => apiFetch<UserPlan>("/api/user/plan"),

  /** Get current access state derived from the user's plan + trial fields */
  getTrialAccessStatus: async () =>
    deriveTrialAccessStatus(await api.getUserPlan()),

  /** Update the authenticated user's subscription plan */
  updateUserPlan: (plan: PlanKey) =>
    apiFetch<{ success: boolean; plan: string }>("/api/user/plan", {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    }),

  /** Get per-date generation usage for a list of ISO date strings */
  getGenerationStatus: (dates: string[]) =>
    apiFetch<{
      success: boolean;
      dates: {
        date: string;
        used: number;
        limit: number;
        remaining: number;
        withinWindow: boolean;
      }[];
    }>(
      `/api/generation-status?${dates.map((d) => `dates[]=${encodeURIComponent(d)}`).join("&")}`
    ),

  /** Generate posts with plan limit enforcement (new endpoint) */
  generatePost: (body: {
    niche: string;
    focusAreas: string[];
    count: number;
    scheduledFor: string;
  }) =>
    apiFetch<{ success: boolean; posts: unknown[]; remaining: number }>(
      "/api/generate-post",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),

  /** Turn a user idea, rough draft, or full post into one polished post */
  writePost: (body: { input: string; scheduledFor?: string }) =>
    apiFetch<{ success: boolean; post: ApiPost; remaining: number }>(
      "/api/write-post",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),
};

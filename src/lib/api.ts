export const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const BASE_OPTS: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...BASE_OPTS,
    ...init,
    headers: { ...BASE_OPTS.headers, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = res.statusText;
    try {
      const parsed = JSON.parse(body);
      message = parsed.error ?? parsed.message ?? res.statusText;
    } catch { /* ignore parse errors */ }
    const err = Object.assign(new Error(message), { status: res.status });
    throw err;
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
  email: string;
  avatar?: string;
};

/** Fields for POST /profile */
export type UserProfilePayload = {
  userNiche: string;
  targetAudience: string;
  focusArea: string;
  productName?: string;
  productDescription?: string;
  productAudience?: string;
  productSolution?: string;
};

/** Returned by GET /profile */
export type UserProfile = {
  userId: string;
  userNiche: string;
  targetAudience: string;
  focusArea: string;
  productName?: string;
  createdAt: string;
};

/** Returned by GET /posts */
export type ApiPost = {
  _id: string;
  finalPost: string;
  status?: string;
  scheduledDate?: string;
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
};

// ------------------------------------------------------------------ //
//  Named API helpers                                                   //
// ------------------------------------------------------------------ //
export const api = {
  /** Check auth — 401 means not logged in. Returns User document. */
  getMe: () => apiFetch<AuthUser>("/auth/me"),

  /** Retrieve current user's niche/audience profile */
  getProfile: () => apiFetch<UserProfile>("/profile"),

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
  generatePosts: (count = 10) =>
    apiFetch<{ success: boolean; posts: unknown[] }>("/generate-subtopic-post", {
      method: "POST",
      body: JSON.stringify({ count }),
    }),

  /** Generate posts for a specific niche + focus areas (Mode B) */
  generateTargetedPosts: (body: {
    niche: string;
    focusAreas: string[];
    count: number;
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
  schedulePost: (content: string, scheduled_at: string) =>
    apiFetch<{ success: boolean; post: ScheduledApiPost }>("/api/posts/schedule", {
      method: "POST",
      body: JSON.stringify({ content, scheduled_at }),
    }),

  /** Bulk-schedule multiple posts with automatic time spacing */
  scheduleBulkPosts: (
    posts: { content: string }[],
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
    body: { content?: string; scheduled_at?: string }
  ) =>
    apiFetch<{ success: boolean; post: ScheduledApiPost }>(`/api/posts/scheduled/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  logout: () => apiFetch<void>("/auth/logout"),
};

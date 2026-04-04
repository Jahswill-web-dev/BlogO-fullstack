const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
    const err = Object.assign(new Error(res.statusText), { status: res.status });
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

  /** Delete a post by ID */
  deletePost: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/posts/${id}`, {
      method: "DELETE",
    }),

  /** Post a tweet to the connected X account */
  postTweet: (text: string) =>
    apiFetch<{ data: { id: string; text: string } }>("/x/tweet", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  logout: () => apiFetch<void>("/auth/logout"),
};

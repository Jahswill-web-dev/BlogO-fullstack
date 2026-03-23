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

// ------------------------------------------------------------------ //
//  Named API helpers                                                   //
// ------------------------------------------------------------------ //
export const api = {
  /** Check auth — 401 means not logged in. Returns User document. */
  getMe: () => apiFetch<AuthUser>("/auth/me"),

  /** Save onboarding form data as the user's niche/audience profile */
  saveProfile: (body: UserProfilePayload) =>
    apiFetch<{ success: boolean; profile: unknown }>("/profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Step 1 — AI creator profile (reads saved /profile from DB, no body needed) */
  generateSaasProfile: () =>
    apiFetch<unknown>("/generate-saas-profile", { method: "POST" }),

  /** Step 2 — Content categories (reads saas profile from DB, no body needed) */
  generateCategories: () =>
    apiFetch<unknown>("/generate-categories", { method: "POST" }),

  /** Step 3 — Content pillars + subtopics (reads categories from DB, no body needed) */
  generateSubtopics: () =>
    apiFetch<unknown>("/generate-subtopics", { method: "POST" }),

  /** Step 4 — Generate N educational posts (randomly picks subtopics from DB) */
  generatePosts: (count = 10) =>
    apiFetch<{ success: boolean; posts: unknown[] }>("/generate-subtopic-post", {
      method: "POST",
      body: JSON.stringify({ count }),
    }),

  logout: () => apiFetch<void>("/auth/logout"),
};

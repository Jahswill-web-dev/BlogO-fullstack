"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { api, ApiPost, UserProfile, ScheduledApiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GeneratePanel } from "@/components/GeneratePanel";
import { DashboardSidebar } from "@/components/modules/DashboardSidebar";
import {
  EditScheduleModal,
  Post,
  dayKey,
} from "@/components/modules/EditScheduleModal";
import { OnboardingPostsModal } from "@/components/modules/OnboardingPostsModal";
import { CalendarCard } from "@/components/modules/CalendarCard";
import { PostDetailPopup } from "@/components/modules/PostDetailPopup";
import { ConnectXModal } from "@/components/modules/ConnectXModal";
import { DayPostsPopup } from "@/components/modules/DayPostsPopup";
import { AutoSchedulePopover } from "@/components/modules/AutoSchedulePopover";
import { PlanSwitcherModal } from "@/components/modules/PlanSwitcherModal";

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isReady } = useProtectedRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingPosts, setOnboardingPosts] = useState<Post[]>([]);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showConnectXModal, setShowConnectXModal] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [detailSourceDay, setDetailSourceDay] = useState<Date | null>(null);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<Date | null>(null);
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [singlePostMode, setSinglePostMode] = useState(false);
  const [planData, setPlanData] = useState<{
    plan: "creator" | "builder" | "authority";
    postsPerDay: number;
    scheduleDaysAhead: number;
    usedToday: number;
    hasActiveSubscription: boolean;
  } | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [xConnected, setXConnected] = useState<boolean | null>(null);
  const [planChosen, setPlanChosen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const fromOnboarding =
      new URLSearchParams(window.location.search).get("schedule") === "true";

    const today9am = new Date();
    today9am.setHours(9, 0, 0, 0);

    Promise.allSettled([api.getPosts(), api.getScheduledPosts()]).then(
      ([crudResult, scheduledResult]) => {
        // ── Raw CRUD posts ───────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let crudRaw: any[] = [];
        if (crudResult.status === "fulfilled") {
          const raw = crudResult.value;
          crudRaw = Array.isArray(raw)
            ? raw
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : ((raw as any)?.posts ?? (raw as any)?.data ?? []);
        } else {
          console.error("[Dashboard] GET /posts failed:", crudResult.reason);
        }

        // ── Raw scheduled API posts ──────────────────────────────────────
        let allScheduledRaw: ScheduledApiPost[] = [];
        if (scheduledResult.status === "fulfilled") {
          allScheduledRaw = scheduledResult.value.posts ?? [];
        } else {
          console.error(
            "[Dashboard] GET /api/posts/scheduled failed:",
            scheduledResult.reason
          );
        }

        // Build a lookup map: scheduledPost._id → scheduledPost
        const scheduledMap = new Map<string, ScheduledApiPost>(
          allScheduledRaw.map((p) => [p._id, p])
        );

        // Track which scheduled post IDs are linked to a CRUD post
        const linkedScheduledIds = new Set<string>();

        // ── Merge: CRUD posts stay as source of truth ────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const crudPosts: Post[] = crudRaw.map((p: any): Post | null => {
          const targetDate = p.targetDate ? new Date(p.targetDate) : undefined;
          const linkedId = p.meta?.scheduledPostId as string | undefined;
          const scheduledInfo = linkedId ? scheduledMap.get(linkedId) : undefined;

          if (linkedId) linkedScheduledIds.add(linkedId);

          if (scheduledInfo) {
            if (scheduledInfo.status === "cancelled" || scheduledInfo.status === "failed") {
              // Scheduled post is dead — show the CRUD post as a plain draft again
              return {
                id: p._id,
                content: p.finalPost,
                platform: "Twitter" as const,
                status: "draft",
                scheduledDate: targetDate ?? new Date(today9am),
                targetDate,
              };
            }
            // Live scheduled post — merge status/time but keep targetDate for calendar grouping
            return {
              id: p._id,
              content: scheduledInfo.content ?? p.finalPost,
              platform: "Twitter" as const,
              status: scheduledInfo.status === "pending" ? "scheduled" : "posted",
              scheduledDate: new Date(scheduledInfo.scheduledAt),
              scheduledPostId: scheduledInfo._id,
              targetDate,
            };
          }

          // Post was marked scheduled but its linked record is gone — treat as draft
          if (p.meta?.scheduled) return null;

          // Plain draft
          return {
            id: p._id,
            content: p.finalPost,
            platform: "Twitter" as const,
            status: (p.status as Post["status"]) ?? "draft",
            scheduledDate: targetDate ?? new Date(today9am),
            targetDate,
          };
        }).filter((p): p is Post => p !== null);

        // ── Standalone scheduled posts (not linked to any CRUD post) ─────
        const standaloneScheduled: Post[] = allScheduledRaw
          .filter(
            (p) =>
              !linkedScheduledIds.has(p._id) &&
              p.status !== "cancelled" &&
              p.status !== "failed"
          )
          .map((p: ScheduledApiPost): Post => ({
            id: p._id,
            content: p.content,
            platform: "Twitter" as const,
            status: p.status === "pending" ? "scheduled" : "posted",
            scheduledDate: new Date(p.scheduledAt),
            scheduledPostId: p._id,
          }));

        const fetched = [...crudPosts, ...standaloneScheduled];
        console.log("[Dashboard] Merged posts:", fetched);
        setPosts(fetched);
        setPostsLoading(false);

        if (
          fromOnboarding &&
          sessionStorage.getItem("blogO_onboarding_shown") !== "true"
        ) {
          setAutoSchedule(true);
          setShowOnboardingModal(true);
          setOnboardingPosts(crudPosts);
        }
      }
    );
  }, [isReady]); // re-runs once isReady flips to true (authenticated)

  useEffect(() => {
    if (!isReady) return;
    api.getProfile()
      .then((profile) => {
        setUserProfile(profile);
        setProfileLoaded(true);
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number }).status;
        setUserProfile(null);
        setProfileLoaded(true);
      });
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    api.getUserPlan()
      .then((d) => {
        setPlanData({
          plan: d.plan,
          postsPerDay: d.postsPerDay,
          scheduleDaysAhead: d.scheduleDaysAhead,
          usedToday: d.usedToday,
          hasActiveSubscription: d.hasActiveSubscription ?? false,
        });
        // Auto-set planChosen so paid subscribers never hit the paywall
        if (d.hasActiveSubscription && user?._id) {
          localStorage.setItem(`blogO_plan_chosen_${user._id}`, "true");
          setPlanChosen(true);
        }
      })
      .catch(() => setPlanData(null));
  }, [isReady, user]);

  // Poll for plan update after returning from Polar checkout
  useEffect(() => {
    if (!isReady) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") !== "success") return;

    // Remove the query param so a refresh doesn't re-trigger
    window.history.replaceState({}, "", window.location.pathname);

    const MAX_ATTEMPTS = 10;
    const POLL_INTERVAL_MS = 2000;
    let attempts = 0;
    let cancelled = false;

    setIsActivating(true);

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const d = await api.getUserPlan();
        if (cancelled) return;
        const upgraded = d.plan !== "creator" || d.hasActiveSubscription;
        setPlanData({
          plan: d.plan,
          postsPerDay: d.postsPerDay,
          scheduleDaysAhead: d.scheduleDaysAhead,
          usedToday: d.usedToday,
          hasActiveSubscription: d.hasActiveSubscription ?? false,
        });
        if (upgraded) {
          setIsActivating(false);
          if (user?._id) {
            localStorage.setItem(`blogO_plan_chosen_${user._id}`, "true");
            setPlanChosen(true);
          }
          toast.success("Plan upgraded! Your new limits are active.");
          return;
        }
      } catch { /* ignore */ }
      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) {
          setIsActivating(false);
          toast.info("Your payment was received. Plan activation may take a moment — refresh the page shortly.");
        }
        return;
      }
      if (!cancelled) setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => { cancelled = true; };
  }, [isReady, user]);

  useEffect(() => {
    if (!isReady) return;
    api.checkXStatus()
      .then(({ connected }) => setXConnected(connected))
      .catch(() => setXConnected(false));
  }, [isReady]);

  // Persist plan-chosen flag per user so the paywall only shows until
  // the user has explicitly selected a plan (even the free Creator plan).
  useEffect(() => {
    if (user?._id) {
      setPlanChosen(!!localStorage.getItem(`blogO_plan_chosen_${user._id}`));
    }
  }, [user]);

  // postsByDay is still needed to compute selectedDayPosts for EditScheduleModal
  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach((p) => {
      if (!p.scheduledDate) return;
      const key = dayKey(p.scheduledDate);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [posts]);

  // Early return after all hooks
  if (!isReady || postsLoading || !profileLoaded) return <LoadingSpinner />;

  const totalPosts = posts.length;
  const postedThisWeek = posts.filter((p) => {
    if (p.status !== "posted" || !p.scheduledDate) return false;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return p.scheduledDate >= weekAgo && p.scheduledDate <= now;
  }).length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  /* ---------- handlers ---------- */
  const handleOnboardingClose = () => {
    sessionStorage.setItem("blogO_onboarding_shown", "true");
    setShowOnboardingModal(false);
  };

  const handleScheduleAll = (postsToSchedule: Post[]) => {
    sessionStorage.setItem("blogO_onboarding_shown", "true");
    setShowOnboardingModal(false);
    if (postsToSchedule.length > 0) {
      setPosts((prev) => {
        const onboardingIds = new Set(onboardingPosts.map((p) => p.id));
        const existing = prev.filter((p) => !onboardingIds.has(p.id));
        return [...existing, ...postsToSchedule];
      });
      setOnboardingPosts(postsToSchedule);
      setShowAutoScheduleModal(true);
    }
  };

  const handlePostClick = (post: Post) => setDetailPost(post);

  const handleEditFromPopup = (post: Post) => {
    setDetailPost(null);
    setDetailSourceDay(null);
    setSinglePostMode(true);
    setSelectedPost(post);
  };

  const handleDelete = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      if (post?.scheduledPostId) {
        await api.cancelScheduledPost(post.scheduledPostId);
        // If the post was originally a CRUD draft, un-mark it so it reappears as a draft
        if (post.id !== post.scheduledPostId) {
          await api.updatePost(post.id, { meta: { scheduled: false, scheduledPostId: null } });
        }
      } else {
        await api.deletePost(id);
      }
    } catch (err) {
      console.error("[Dashboard] DELETE failed:", err);
    }
  };

  const handleUnschedule = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post?.scheduledPostId) return;

    // Optimistic update — revert to draft immediately
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "draft" as const, scheduledPostId: undefined } : p
      )
    );
    setDetailPost((prev) =>
      prev?.id === id ? { ...prev, status: "draft" as const, scheduledPostId: undefined } : prev
    );

    try {
      await api.cancelScheduledPost(post.scheduledPostId);
      // Un-mark the CRUD post so it reappears as a plain draft
      if (post.id !== post.scheduledPostId) {
        await api.updatePost(post.id, { meta: { scheduled: false, scheduledPostId: null } });
      }
      toast.success("Post unscheduled — moved back to drafts.");
    } catch (err) {
      console.error("[Dashboard] Unschedule failed:", err);
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "scheduled" as const, scheduledPostId: post.scheduledPostId } : p
        )
      );
      setDetailPost((prev) =>
        prev?.id === id ? { ...prev, status: "scheduled" as const, scheduledPostId: post.scheduledPostId } : prev
      );
      toast.error("Failed to unschedule. Please try again.");
    }
  };

  const handlePostNow = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // Paywall: require plan selection before posting to X
    if (!planChosen && !planData?.hasActiveSubscription) {
      setShowPlanModal(true);
      return;
    }

    // Check X connection status before attempting to post
    if (xConnected === false) {
      setShowConnectXModal(true);
      return;
    }
    try {
      const { connected } = await api.checkXStatus();
      setXConnected(connected);
      if (!connected) {
        setShowConnectXModal(true);
        return;
      }
    } catch (err) {
      console.error("[Dashboard] GET /auth/x/status failed:", err);
      setShowConnectXModal(true);
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "posted" } : p))
    );

    try {
      await api.postTweet(post.content);
      toast.success("Post published to X successfully!");
    } catch (err) {
      console.error("[Dashboard] POST /x/tweet failed:", err);
      // Revert status on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "scheduled" } : p))
      );
      toast.error("Failed to publish post to X. Please try again.");
    }
  };

  const handleContentSave = async (id: string, content: string) => {
    const post = posts.find((p) => p.id === id);
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content } : p))
    );
    setDetailPost((prev) => (prev?.id === id ? { ...prev, content } : prev));
    try {
      if (post?.scheduledPostId) {
        // Always push the new content to the BullMQ queue so it publishes correctly
        await api.updateScheduledPost(post.scheduledPostId, { content });
      }
      if (!post?.scheduledPostId || post.id !== post.scheduledPostId) {
        // Also update the CRUD post when it is a separate record (i.e. not a
        // standalone ScheduledPost where id === scheduledPostId)
        await api.updatePost(id, { finalPost: content });
      }
    } catch (err) {
      console.error("[Dashboard] Content save failed:", err);
    }
  };

  const handleGenerateCarousel = async (params: {
    niche: string;
    focusArea: string;
    slideCount: number;
    scheduledFor: Date;
  }) => {
    setIsGenerating(true);
    const calendarDate = params.scheduledFor;
    const scheduledForKey = dayKey(calendarDate);
    try {
      const res = await api.generatePost({
        niche: params.niche,
        focusAreas: [params.focusArea],
        count: params.slideCount,
        scheduledFor: scheduledForKey,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newPosts: Post[] = (res.posts as ApiPost[]).map((p: any) => ({
        id: p._id ?? p.id,
        content: p.finalPost,
        platform: "Twitter" as const,
        status: "draft" as const,
        scheduledDate: p.targetDate ? new Date(p.targetDate) : calendarDate,
        targetDate: p.targetDate ? new Date(p.targetDate) : calendarDate,
      }));
      setPosts((prev) => [...newPosts, ...prev]);
      setOnboardingPosts(newPosts);
      setAutoSchedule(false);
      setShowOnboardingModal(true);
      setShowGeneratePanel(false);
      // Update usage count now that new posts have been generated
      api.getUserPlan()
        .then((d) => setPlanData({ plan: d.plan, postsPerDay: d.postsPerDay, scheduleDaysAhead: d.scheduleDaysAhead, usedToday: d.usedToday, hasActiveSubscription: d.hasActiveSubscription }))
        .catch(() => {});
    } catch (err) {
      const status = (err as { status?: number }).status;
      // 403 = expected business-logic rejection (daily limit / window exceeded).
      // Don't console.error — Next.js dev overlay treats console.error(Error) as
      // an unhandled error and shows the red overlay even when the error is caught.
      if (status !== 403) {
        console.error("[Dashboard] Generate posts failed:", err);
      }
      // Re-throw so GeneratePanel can surface the error inline.
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSchedule = async (scheduledPosts: Post[]) => {
    if (scheduledPosts.length === 0) return;

    // Paywall: require plan selection before scheduling
    if (!planChosen && !planData?.hasActiveSubscription) {
      setShowPlanModal(true);
      return;
    }

    if (xConnected === false) {
      setShowConnectXModal(true);
      return;
    }

    if (planData) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + planData.scheduleDaysAhead);
      maxDate.setHours(23, 59, 59, 999);
      const outOfWindow = scheduledPosts.some((p) => p.scheduledDate && p.scheduledDate > maxDate);
      if (outOfWindow) {
        const planLabel = { creator: "Creator", builder: "Builder", authority: "Authority" }[planData.plan] ?? planData.plan;
        toast.error(`One or more posts are outside your ${planLabel} plan's ${planData.scheduleDaysAhead}-day scheduling window. Upgrade to schedule further ahead.`);
        return;
      }
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        const updated = scheduledPosts.find((s) => s.id === p.id);
        return updated ?? p;
      })
    );

    const startTime = scheduledPosts[0].scheduledDate!.toISOString();
    const frequencyHours =
      scheduledPosts.length > 1
        ? (scheduledPosts[1].scheduledDate!.getTime() -
            scheduledPosts[0].scheduledDate!.getTime()) /
          3_600_000
        : 1;

    try {
      const result = await api.scheduleBulkPosts(
        scheduledPosts.map((p) => ({ content: p.content })),
        startTime,
        frequencyHours
      );

      const idMap = new Map(
        result.posts.map((rp, i) => [scheduledPosts[i]?.id, rp._id])
      );

      // Mark each CRUD post as scheduled in the backend (non-blocking)
      scheduledPosts.forEach((p, i) => {
        const scheduledPostId = result.posts[i]?._id;
        if (scheduledPostId) {
          api
            .updatePost(p.id, { meta: { scheduled: true, scheduledPostId } })
            .catch(() => {});
        }
      });

      setPosts((prev) =>
        prev.map((p) =>
          idMap.has(p.id) ? { ...p, scheduledPostId: idMap.get(p.id) } : p
        )
      );
      toast.success(
        `${scheduledPosts.length} post${scheduledPosts.length !== 1 ? "s" : ""} scheduled!`
      );
    } catch (err) {
      console.error("[Dashboard] Bulk schedule failed:", err);
      const ids = new Set(scheduledPosts.map((p) => p.id));
      setPosts((prev) =>
        prev.map((p) =>
          ids.has(p.id)
            ? { ...p, status: "draft" as const, scheduledDate: undefined }
            : p
        )
      );
      toast.error("Failed to schedule posts. Please try again.");
    }
  };

  const handleSave = async (id: string, content: string, date: Date) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // Paywall: require plan selection before scheduling
    if (!planChosen && !planData?.hasActiveSubscription) {
      setShowPlanModal(true);
      return;
    }

    if (xConnected === false) {
      setShowConnectXModal(true);
      return;
    }

    if (planData) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + planData.scheduleDaysAhead);
      maxDate.setHours(23, 59, 59, 999);
      if (date > maxDate) {
        const planLabel = { creator: "Creator", builder: "Builder", authority: "Authority" }[planData.plan] ?? planData.plan;
        toast.error(`Your ${planLabel} plan can only schedule ${planData.scheduleDaysAhead} day(s) ahead. Upgrade to schedule further.`);
        return;
      }
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, content, scheduledDate: date, status: "scheduled" }
          : p
      )
    );

    try {
      if (post.scheduledPostId) {
        // Reschedule an already-scheduled post
        await api.updateScheduledPost(post.scheduledPostId, {
          content,
          scheduled_at: date.toISOString(),
        });
      } else {
        // Schedule a draft for the first time
        const result = await api.schedulePost(content, date.toISOString());
        const scheduledPostId = result.post._id;
        // Mark the CRUD post so it doesn't reappear as a draft on refresh
        await api.updatePost(id, {
          finalPost: content,
          meta: { scheduled: true, scheduledPostId },
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, scheduledPostId } : p))
        );
      }
      toast.success("Post scheduled!");
    } catch (err) {
      console.error("[Dashboard] Schedule post failed:", err);
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: post.status, scheduledDate: post.scheduledDate }
            : p
        )
      );
      toast.error((err as Error).message || "Failed to schedule post. Please try again.");
    }
  };

  const selectedDayPosts = singlePostMode || !selectedPost?.scheduledDate
    ? ([selectedPost].filter(Boolean) as Post[])
    : (postsByDay[dayKey(selectedPost.scheduledDate)] ?? [selectedPost]);

  return (
    <div className="min-h-screen bg-[#08060A] flex relative">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header card */}
          <div className="bg-[#0B0F19] rounded-xl border border-[#1F2933] mb-8">
            {/* Top bar */}
            <div className="grid grid-cols-3 items-center px-4 py-3">
              {/* Left — greeting */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden text-white/60 hover:text-white flex-shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-sm sm:text-base leading-tight">
                  <span className="hidden sm:inline text-white/50">Hi </span>
                  <span className="font-semibold text-white">
                    {user?.name?.split(" ")[0] ?? "there"}
                  </span>
                  <span className="hidden sm:inline text-white/50">
                    , what&apos;s the update?
                  </span>
                  <span className="sm:hidden text-white/50"> 👋</span>
                </h1>
              </div>

              {/* Centre — plan indicator */}
              <div className="flex items-center justify-center">
                {isActivating ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
                      style={{ borderColor: "#9d8ee8", borderTopColor: "transparent" }}
                    />
                    <span style={{ fontSize: 11, color: "#d6ccff", whiteSpace: "nowrap", fontWeight: 500 }}>
                      Activating…
                    </span>
                  </div>
                ) : planData ? (() => {
                  const PLAN_NAMES: Record<string, string> = { creator: "Creator", builder: "Builder", authority: "Authority" };
                  return (
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontSize: 11,
                          color: "#d6ccff",
                          background: "#2d2650",
                          border: "1px solid #9d8ee8",
                          borderRadius: 999,
                          padding: "3px 9px",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        {PLAN_NAMES[planData.plan] ?? planData.plan}
                      </span>
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="text-[11px] font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "#9d8ee8" }}
                      >
                        Change
                      </button>
                    </div>
                  );
                })() : null}
              </div>

              {/* Right — create button */}
              <div className="flex items-center justify-end">
                <button
                  className="flex items-center gap-1.5 text-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: "#5C3FED" }}
                  onClick={() => { setCalendarSelectedDay(null); setShowGeneratePanel(true); }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create post</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3" style={{ borderTop: "0.5px solid #1F2933" }}>
              {(
                [
                  { label: "All Time", value: totalPosts, unit: "tweets", dot: "#5C3FED" },
                  { label: "This Week", value: postedThisWeek, unit: "tweeted", dot: "#E36A3A" },
                  { label: "Scheduled", value: scheduledCount, unit: "queued", dot: "#22c55e" },
                ] as const
              ).map(({ label, value, unit, dot }, i) => (
                <div
                  key={label}
                  className="px-4 py-3 sm:px-6 sm:py-4"
                  style={i > 0 ? { borderLeft: "0.5px solid #1F2933" } : {}}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dot }}
                    />
                    <span className="text-[9px] sm:text-[10px] font-medium text-white/40 uppercase tracking-widest">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[18px] sm:text-[22px] font-medium text-white leading-none">
                      {value}
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/30">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan usage strip */}
            {planData && (() => {
              const PLAN_NAMES: Record<string, string> = { creator: "Creator", builder: "Builder", authority: "Authority" };
              const planName = PLAN_NAMES[planData.plan] ?? planData.plan;
              const pct = planData.postsPerDay > 0
                ? Math.min((planData.usedToday / planData.postsPerDay) * 100, 100)
                : 0;
              const isLimitReached = planData.usedToday >= planData.postsPerDay;
              return (
                <div
                  className="px-4 py-3 sm:px-6"
                  style={{ borderTop: "0.5px solid #1F2933" }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        style={{
                          fontSize: 10,
                          color: "#d6ccff",
                          background: "#2d2650",
                          border: "1px solid #9d8ee8",
                          borderRadius: 999,
                          padding: "2px 7px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {planName}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-white/40 truncate">
                        Today&apos;s generation
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: isLimitReached ? "#f59e0b" : "#6b7280",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {isLimitReached
                        ? "Limit reached"
                        : `${planData.usedToday} / ${planData.postsPerDay} posts`}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 4,
                      background: "#1e1e2e",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: isLimitReached ? "#f59e0b" : "#9d8ee8",
                        borderRadius: 999,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Generating banner */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                key="generating-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{
                  background: "rgba(92,63,237,0.08)",
                  borderColor: "rgba(92,63,237,0.25)",
                }}
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                  style={{ borderColor: "#5C3FED", borderTopColor: "transparent" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90">Generating your posts…</p>
                  <p className="text-xs text-white/40">This may take a moment. You can keep browsing.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* X account not connected — banner */}
          {xConnected === false && (
            <div
              className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
              style={{ background: "rgba(0,0,0,0.35)", borderColor: "#1F2933" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#000" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white leading-tight">Connect your X account</p>
                  <p className="text-xs text-white/40 mt-0.5">Required to schedule and publish posts</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectXModal(true)}
                className="flex-shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{ background: "#5C3FED" }}
              >
                Connect
              </button>
            </div>
          )}

          {/* Calendar */}
          <div>
            <CalendarCard
              posts={posts}
              onPostClick={handlePostClick}
              onBulkSchedule={handleBulkSchedule}
              onGenerateClick={(day) => { setCalendarSelectedDay(day); setShowGeneratePanel(true); }}
              onDayClick={(day) => { setCalendarSelectedDay(day); setDayPopupDate(day); }}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {detailPost && (
          <PostDetailPopup
            key="post-detail"
            post={detailPost}
            user={user}
            onClose={() => { setDetailPost(null); setDetailSourceDay(null); }}
            onEdit={handleEditFromPopup}
            onDelete={handleDelete}
            onUnschedule={handleUnschedule}
            onPostNow={handlePostNow}
            onContentSave={handleContentSave}
            onSchedule={(id, date, content) => {
              handleSave(id, content, date);
              setDetailPost((prev) =>
                prev?.id === id ? { ...prev, content, scheduledDate: date, status: "scheduled" } : prev
              );
            }}
            onBack={detailSourceDay ? () => {
              setDetailPost(null);
              setDayPopupDate(detailSourceDay);
              setDetailSourceDay(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

      {selectedPost && (
        <EditScheduleModal
          post={selectedPost}
          dayPosts={selectedDayPosts}
          onClose={() => { setSelectedPost(null); setSinglePostMode(false); }}
          onSave={handleSave}
          initialFrequency={autoSchedule ? "Every 2 hours" : "Every 5 minutes"}
        />
      )}

      <AnimatePresence>
        {showOnboardingModal && (
          <OnboardingPostsModal
            key="onboarding-modal"
            posts={onboardingPosts}
            user={user}
            onClose={handleOnboardingClose}
            onScheduleAll={handleScheduleAll}
            onDelete={handleDelete}
            onUpdate={(id, content) => {
              setOnboardingPosts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, content } : p))
              );
              handleContentSave(id, content);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAutoScheduleModal && (
          <motion.div
            key="auto-schedule-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAutoScheduleModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <AutoSchedulePopover
                posts={onboardingPosts}
                onClose={() => setShowAutoScheduleModal(false)}
                onConfirm={(scheduledPosts) => {
                  handleBulkSchedule(scheduledPosts);
                  setShowAutoScheduleModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGeneratePanel && (
          <GeneratePanel
            key="generate-panel"
            isOpen={showGeneratePanel}
            onClose={() => setShowGeneratePanel(false)}
            userNiche={userProfile?.userNiche ?? ""}
            onGenerate={handleGenerateCarousel}
            isGenerating={isGenerating}
            targetDate={calendarSelectedDay ?? undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dayPopupDate && (
          <DayPostsPopup
            key="day-posts-popup"
            day={dayPopupDate}
            posts={postsByDay[dayKey(dayPopupDate)] ?? []}
            user={user}
            onClose={() => setDayPopupDate(null)}
            onPostClick={(post) => {
              setDetailSourceDay(dayPopupDate);
              setDayPopupDate(null);
              setDetailPost(post);
            }}
            onGenerateClick={() => {
              setCalendarSelectedDay(dayPopupDate);
              setDayPopupDate(null);
              setShowGeneratePanel(true);
            }}
          />
        )}
      </AnimatePresence>

      <ConnectXModal
        isOpen={showConnectXModal}
        onClose={() => setShowConnectXModal(false)}
      />

      {showPlanModal && planData && (
        <PlanSwitcherModal
          currentPlan={planData.plan}
          hasActiveSubscription={planData.hasActiveSubscription}
          onClose={() => setShowPlanModal(false)}
          title={!planChosen && !planData.hasActiveSubscription ? "Choose your plan" : "Change plan"}
          subtitle={!planChosen && !planData.hasActiveSubscription ? "Pick a plan to unlock scheduling and posting to X" : "Select a plan to switch to"}
          onPlanChange={() => {
            // Mark that the user has explicitly selected a plan
            if (user?._id) {
              localStorage.setItem(`blogO_plan_chosen_${user._id}`, "true");
              setPlanChosen(true);
            }
            api.getUserPlan()
              .then((d) => setPlanData({ plan: d.plan, postsPerDay: d.postsPerDay, scheduleDaysAhead: d.scheduleDaysAhead, usedToday: d.usedToday, hasActiveSubscription: d.hasActiveSubscription ?? false }))
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}

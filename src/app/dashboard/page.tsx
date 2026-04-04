"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiPost, UserProfile } from "@/lib/api";
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

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
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

  useEffect(() => {
    const fromOnboarding =
      new URLSearchParams(window.location.search).get("schedule") === "true";

    api
      .getPosts()
      .then((raw) => {
        console.log("[Dashboard] GET /posts raw response:", JSON.stringify(raw));
        // Unwrap if the backend returns { posts: [...] } or { data: [...] }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiPosts = Array.isArray(raw)
          ? raw
          : ((raw as any)?.posts ?? (raw as any)?.data ?? []);
        console.log("[Dashboard] GET /posts response:", apiPosts);

        if (!apiPosts || apiPosts.length === 0) {
          setPostsLoading(false);
          return;
        }

        const today9am = new Date();
        today9am.setHours(9, 0, 0, 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetched: Post[] = apiPosts.map((p: any) => ({
          id: p._id,
          content: p.finalPost,
          platform: "Twitter",
          status: (p.status as Post["status"]) ?? "draft",
          scheduledDate: p.scheduledDate
            ? new Date(p.scheduledDate)
            : new Date(today9am),
        }));

        console.log("[Dashboard] Mapped posts:", fetched);
        setPosts(fetched);
        setPostsLoading(false);

        if (
          fromOnboarding &&
          sessionStorage.getItem("blogO_onboarding_shown") !== "true"
        ) {
          setAutoSchedule(true);
          setShowOnboardingModal(true);
          setOnboardingPosts(fetched);
        }
      })
      .catch((err) => {
        console.error("[Dashboard] GET /posts failed:", err);
        setPostsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.getProfile().then(setUserProfile).catch(() => setUserProfile(null));
  }, []);

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
  if (authLoading || postsLoading) return <LoadingSpinner />;

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
      setSelectedPost(postsToSchedule[0]);
    }
  };

  const handlePostClick = (post: Post) => setDetailPost(post);

  const handleEditFromPopup = (post: Post) => {
    setDetailPost(null);
    setSelectedPost(post);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePostNow = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "posted" } : p))
    );

    try {
      await api.postTweet(post.content);
    } catch (err) {
      console.error("[Dashboard] POST /x/tweet failed:", err);
      // Revert status on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "scheduled" } : p))
      );
      alert("Failed to post tweet. Make sure your X account is connected.");
    }
  };

  const handleContentSave = (id: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content } : p))
    );
    setDetailPost((prev) => (prev?.id === id ? { ...prev, content } : prev));
  };

  const handleGenerateCarousel = async (params: {
    niche: string;
    focusArea: string;
    slideCount: number;
  }) => {
    setIsGenerating(true);
    try {
      const res = await api.generateTargetedPosts({
        niche: params.niche,
        focusAreas: [params.focusArea],
        count: params.slideCount,
      });
      const today9am = new Date();
      today9am.setHours(9, 0, 0, 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newPosts: Post[] = (res.posts as ApiPost[]).map((p: any) => ({
        id: p._id,
        content: p.finalPost,
        platform: "Twitter" as const,
        status: "draft" as const,
        scheduledDate: new Date(today9am),
      }));
      setPosts((prev) => [...newPosts, ...prev]);
      setOnboardingPosts(newPosts);
      setAutoSchedule(false);
      setShowOnboardingModal(true);
      setShowGeneratePanel(false);
    } catch (err) {
      console.error("[Dashboard] Generate targeted posts failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSchedule = (scheduledPosts: Post[]) => {
    setPosts((prev) =>
      prev.map((p) => {
        const updated = scheduledPosts.find((s) => s.id === p.id);
        return updated ?? p;
      })
    );
  };

  const handleSave = (id: string, content: string, date: Date) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, content, scheduledDate: date, status: "scheduled" }
          : p
      )
    );
  };

  const selectedDayPosts = selectedPost?.scheduledDate
    ? (postsByDay[dayKey(selectedPost.scheduledDate)] ?? [selectedPost])
    : ([selectedPost].filter(Boolean) as Post[]);

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
            <div className="flex items-center justify-between px-4 py-3">
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
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 text-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: "#5C3FED" }}
                  onClick={() => setShowGeneratePanel(true)}
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
          </div>

          {/* Calendar */}
          <div>
            <CalendarCard
              posts={posts}
              onPostClick={handlePostClick}
              onBulkSchedule={handleBulkSchedule}
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
            onClose={() => setDetailPost(null)}
            onEdit={handleEditFromPopup}
            onDelete={handleDelete}
            onPostNow={handlePostNow}
            onContentSave={handleContentSave}
          />
        )}
      </AnimatePresence>

      {selectedPost && (
        <EditScheduleModal
          post={selectedPost}
          dayPosts={selectedDayPosts}
          onClose={() => setSelectedPost(null)}
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
          />
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}

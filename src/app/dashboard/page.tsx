"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
/*  Sample data                                                         */
/* ------------------------------------------------------------------ */
function makeSamplePosts(): Post[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const at = (day: number, hour = 20) => new Date(y, m, day, hour, 0, 0);

  return [
    { id: "1",  content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(1, 20) },
    { id: "2",  content: "Most users don't know that consistent posting is the #1 driver of follower growth. We studied 200 accounts and found this pattern 👇", platform: "Twitter", status: "scheduled", scheduledDate: at(2, 20) },
    { id: "3",  content: "Most users delay publishing because they don't have a clear content calendar. Use this free template to plan 30 days of content in 1 hour.", platform: "Twitter", status: "posted",    scheduledDate: at(3, 20) },
    { id: "4",  content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(4, 20) },
    { id: "5",  content: "Most users don't know that consistent posting is the #1 driver of follower growth. We studied 200 accounts and found this pattern 👇", platform: "Twitter", status: "scheduled", scheduledDate: at(5, 20) },
    { id: "6",  content: "Most users delay publishing because they don't have a clear content calendar. Use this free template to plan 30 days of content in 1 hour.", platform: "Twitter", status: "scheduled", scheduledDate: at(6, 20) },
    { id: "7",  content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "draft",     scheduledDate: at(7, 20) },
    { id: "8",  content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(1, 14) },
    { id: "9",  content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "scheduled", scheduledDate: at(2, 14) },
    { id: "10", content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(3, 14) },
    { id: "11", content: "Most users don't know that consistent posting is the #1 driver of follower growth.", platform: "Twitter", status: "posted",    scheduledDate: at(4, 14) },
    { id: "12", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "scheduled", scheduledDate: at(5, 14) },
    { id: "13", content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(6, 14) },
    { id: "14", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter", status: "draft",     scheduledDate: at(7, 14) },
    { id: "15", content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(1, 10) },
    { id: "16", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter", status: "scheduled", scheduledDate: at(2, 10) },
    { id: "17", content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(3, 10) },
    { id: "18", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "posted",    scheduledDate: at(4, 10) },
    { id: "19", content: "Most users don't realise how much time they waste on manual scheduling.", platform: "Twitter", status: "scheduled", scheduledDate: at(5, 10) },
    { id: "20", content: "Coded for ~7 hours today.\nGot a call from my co-founder in the middle of it we just crossed $20k MRR.\nStill processing it.\nThe funnel improvements finally clicked.", platform: "Twitter", status: "scheduled", scheduledDate: at(6, 10) },
    { id: "21", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "draft",     scheduledDate: at(7, 10) },
    { id: "22", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter", status: "scheduled", scheduledDate: at(8,  20) },
    { id: "23", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter",        status: "scheduled", scheduledDate: at(9,  20) },
    { id: "24", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "draft",     scheduledDate: at(10, 20) },
    { id: "25", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter", status: "scheduled", scheduledDate: at(11, 20) },
    { id: "26", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter",        status: "scheduled", scheduledDate: at(12, 20) },
    { id: "27", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter", status: "scheduled", scheduledDate: at(13, 20) },
    { id: "28", content: "Most users don't realise how much time they waste on manual scheduling.", platform: "Twitter",      status: "draft",     scheduledDate: at(14, 20) },
  ];
}

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
          console.log("[Dashboard] No posts returned, using sample data");
          setPosts(makeSamplePosts());
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
        setPosts(makeSamplePosts());
        setPostsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handlePostNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "posted" } : p))
    );
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
                <button className="flex items-center gap-1.5 border border-[#1F2933] text-white/60 hover:text-white hover:border-[#2f3336] transition rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{scheduledCount}</span>
                  <span className="hidden sm:inline ml-0.5">tweets</span>
                </button>
                <button
                  className="flex items-center gap-1.5 text-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: "#5C3FED" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Generate tweets</span>
                  <span className="sm:hidden">Generate</span>
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
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
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
/*  Stat Card                                                           */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className={`${gradient} rounded-xl p-5`}>
      <p className="text-gray-400 text-sm mb-3">{label}</p>
      <p className="text-white text-4xl font-bold">{value}</p>
    </div>
  );
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
          <button
            className="lg:hidden mb-4 text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Hi {user?.name?.split(" ")[0] ?? "there"}, what&apos;s the
              update?
            </h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#1F2933] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#263241] transition border border-[#1F2933]">
                <ChevronDown className="w-4 h-4" />
                {scheduledCount} Tweets
              </button>
              <GradientButton
                buttonLabel="Generate Tweets"
                className="px-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard
              label="All Time Tweets"
              value={totalPosts}
              gradient="bg-[linear-gradient(135deg,#1a0f3d_0%,#2d1b69_100%)]"
            />
            <StatCard
              label="Tweeted This Week"
              value={postedThisWeek}
              gradient="bg-[linear-gradient(135deg,#2a1205_0%,#5c2a0a_100%)]"
            />
            <StatCard
              label="Scheduled Tweets"
              value={scheduledCount}
              gradient="bg-[linear-gradient(135deg,#0d1628_0%,#1a2d50_100%)]"
            />
          </div>

          {/* Calendar */}
          <div className="mt-8">
            <CalendarCard posts={posts} onPostClick={handlePostClick} />
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

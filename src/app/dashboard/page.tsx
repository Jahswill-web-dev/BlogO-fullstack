"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { GradientButton } from "@/components/ui/buttons/gradientButton";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardSidebar } from "@/components/modules/DashboardSidebar";
import {
  EditScheduleModal,
  Post,
  dayKey,
} from "@/components/modules/EditScheduleModal";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getWeekDays(month: Date, weekNumber: number): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
  const weekStart = new Date(firstSunday);
  weekStart.setDate(firstSunday.getDate() + (weekNumber - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

const postCardBg = (status: Post["status"]) => {
  switch (status) {
    case "scheduled": return "bg-[#1a2638]";
    case "posted":    return "bg-[#0f2d1a]";
    case "draft":     return "bg-[#262626]";
  }
};

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
  const [posts, setPosts] = useState<Post[]>(makeSamplePosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeWeek, setActiveWeek] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All hooks before any conditional return
  const weekDays = useMemo(
    () => getWeekDays(currentMonth, activeWeek),
    [currentMonth, activeWeek]
  );

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
  if (authLoading) return <LoadingSpinner />;

  const totalPosts = posts.length;
  const postedThisWeek = posts.filter((p) => {
    if (p.status !== "posted" || !p.scheduledDate) return false;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return p.scheduledDate >= weekAgo && p.scheduledDate <= now;
  }).length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
    setActiveWeek(1);
  };

  const handleSave = (id: string, content: string, date: Date) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, content, scheduledDate: date, status: "scheduled" } : p
      )
    );
  };

  const selectedDayPosts = selectedPost?.scheduledDate
    ? (postsByDay[dayKey(selectedPost.scheduledDate)] ?? [selectedPost])
    : [selectedPost].filter(Boolean) as Post[];

  return (
    <div className="min-h-screen bg-[#08060A] flex">
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
              Hi {user?.name?.split(" ")[0] ?? "there"}, what&apos;s the update?
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-medium text-sm min-w-[130px] text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-[#0F1419] rounded-lg p-1">
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className={`px-3 py-1.5 rounded-md text-sm transition ${
                      activeWeek === w
                        ? "bg-[#1F2933] text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Week {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((day, idx) => {
                    const isToday = dayKey(day) === dayKey(new Date());
                    return (
                      <div
                        key={idx}
                        className="bg-[#0F1419] rounded-t-lg p-3 text-center"
                      >
                        <p
                          className={`font-semibold text-lg leading-none ${
                            isToday ? "text-[#5C3FED]" : "text-white"
                          }`}
                        >
                          {day.getDate()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {DAY_NAMES[day.getDay()]}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, idx) => {
                    const key = dayKey(day);
                    const dayPosts = postsByDay[key] ?? [];
                    return (
                      <div
                        key={idx}
                        className="bg-[#0F1419] rounded-b-lg p-2 min-h-[200px] space-y-1.5"
                      >
                        {dayPosts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className={`w-full text-left p-2 rounded-md transition-all hover:brightness-125 hover:scale-[1.02] ${postCardBg(
                              post.status
                            )}`}
                          >
                            <p className="text-white/50 text-[10px] mb-0.5">
                              {post.scheduledDate?.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-white/80 text-[11px] line-clamp-2 leading-snug">
                              {post.content}
                            </p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedPost && (
        <EditScheduleModal
          post={selectedPost}
          dayPosts={selectedDayPosts}
          onClose={() => setSelectedPost(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

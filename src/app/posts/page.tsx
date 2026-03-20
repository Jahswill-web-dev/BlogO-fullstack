"use client";

import React, { useMemo, useState } from "react";
import {
  Home,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  X,
  Menu,
} from "lucide-react";
import { GradientButton } from "@/components/ui/buttons/gradientButton";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Post = {
  id: string;
  content: string;
  platform: "Twitter";
  status: "draft" | "scheduled" | "posted";
  scheduledDate?: Date;
};

/* ------------------------------------------------------------------ */
/*  Sample data — spread across current month                          */
/* ------------------------------------------------------------------ */
function makeSamplePosts(): Post[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const at = (day: number, hour = 20) => new Date(y, m, day, hour, 0, 0);

  return [
    // Week 1
    { id: "1",  content: "Most users don't realise how much time they waste on manual scheduling. Here's a 3-step system that saved our team 5 hours a week. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(1, 20) },
    { id: "2",  content: "Most users don't know that consistent posting is the #1 driver of follower growth. We studied 200 accounts and found this pattern 👇", platform: "Twitter", status: "scheduled", scheduledDate: at(2, 20) },
    { id: "3",  content: "Most users delay publishing because they don't have a clear content calendar. Use this free template to plan 30 days of content in 1 hour.", platform: "Twitter",  status: "posted",    scheduledDate: at(3, 20) },
    { id: "4",  content: "Most users don't realise how much time they waste on manual scheduling. Here's a 3-step system that saved our team 5 hours a week. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(4, 20) },
    { id: "5",  content: "Most users don't know that consistent posting is the #1 driver of follower growth. We studied 200 accounts and found this pattern 👇", platform: "Twitter", status: "scheduled", scheduledDate: at(5, 20) },
    { id: "6",  content: "Most users delay publishing because they don't have a clear content calendar. Use this free template to plan 30 days of content in 1 hour.", platform: "Twitter",  status: "scheduled", scheduledDate: at(6, 20) },
    { id: "7",  content: "Most users don't realise how much time they waste on manual scheduling. Here's a 3-step system. 🧵", platform: "Twitter",   status: "draft", scheduledDate: at(7, 20) },
    // Week 1 — second row
    { id: "8",  content: "Most users don't know that consistent posting is the #1 driver of follower growth 👇", platform: "Twitter", status: "scheduled", scheduledDate: at(1, 14) },
    { id: "9",  content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "scheduled", scheduledDate: at(2, 14) },
    { id: "10", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(3, 14) },
    { id: "11", content: "Most users don't know that consistent posting is the #1 driver of follower growth.", platform: "Twitter", status: "posted",    scheduledDate: at(4, 14) },
    { id: "12", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "scheduled", scheduledDate: at(5, 14) },
    { id: "13", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(6, 14) },
    { id: "14", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter", status: "draft",    scheduledDate: at(7, 14) },
    // Week 1 — third row
    { id: "15", content: "Most users delay publishing because they don't have a clear content calendar. Use this free template.", platform: "Twitter",  status: "scheduled", scheduledDate: at(1, 10) },
    { id: "16", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(2, 10) },
    { id: "17", content: "Most users don't know that consistent posting is the #1 driver of follower growth.", platform: "Twitter", status: "scheduled", scheduledDate: at(3, 10) },
    { id: "18", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "posted",    scheduledDate: at(4, 10) },
    { id: "19", content: "Most users don't realise how much time they waste on manual scheduling.", platform: "Twitter",   status: "scheduled", scheduledDate: at(5, 10) },
    { id: "20", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter", status: "scheduled", scheduledDate: at(6, 10) },
    { id: "21", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "draft",    scheduledDate: at(7, 10) },
    // Week 2
    { id: "22", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(8,  20) },
    { id: "23", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter", status: "scheduled", scheduledDate: at(9,  20) },
    { id: "24", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "draft",    scheduledDate: at(10, 20) },
    { id: "25", content: "Most users don't realise how much time they waste on manual scheduling. 🧵", platform: "Twitter",   status: "scheduled", scheduledDate: at(11, 20) },
    { id: "26", content: "Most users don't know that consistent posting drives follower growth.", platform: "Twitter", status: "scheduled", scheduledDate: at(12, 20) },
    { id: "27", content: "Most users delay publishing because they don't have a clear content calendar.", platform: "Twitter",  status: "scheduled", scheduledDate: at(13, 20) },
    { id: "28", content: "Most users don't realise how much time they waste on manual scheduling.", platform: "Twitter",   status: "draft",    scheduledDate: at(14, 20) },
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

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const platformCardBg = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "twitter":   return "bg-[#3d1515]";
    case "instagram": return "bg-[#0f2d1a]";
    case "linkedin":  return "bg-[#0a1f2d]";
    default:          return "bg-[#1F2933]";
  }
};

const platformBadge = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "twitter":   return "bg-red-900/50 text-red-300";
    case "instagram": return "bg-green-900/50 text-green-300";
    case "linkedin":  return "bg-sky-900/50 text-sky-300";
    default:          return "bg-gray-700 text-gray-300";
  }
};

/* ------------------------------------------------------------------ */
/*  X Card Modal                                                        */
/* ------------------------------------------------------------------ */
function XCardModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const scheduledStr = post.scheduledDate
    ? post.scheduledDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0F1419] border border-[#2f3336] rounded-2xl p-4 w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex-shrink-0" />

          {/* Name / handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold leading-tight">BlogO User</p>
                <p className="text-gray-500 text-xs">@blogo_user</p>
              </div>
              {/* X logo */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-white text-sm leading-relaxed mt-3">{post.content}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${platformBadge(post.platform)}`}>
            {post.platform}
          </span>
          {scheduledStr && (
            <span className="text-gray-500 text-xs">Scheduled for {scheduledStr}</span>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2f3336] text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-sky-400 transition group">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs group-hover:text-sky-400">Reply</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-green-400 transition group">
            <Repeat2 className="w-4 h-4" />
            <span className="text-xs group-hover:text-green-400">Repost</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-pink-400 transition group">
            <Heart className="w-4 h-4" />
            <span className="text-xs group-hover:text-pink-400">Like</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-sky-400 transition group">
            <Share className="w-4 h-4" />
            <span className="text-xs group-hover:text-sky-400">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#08060A] border-r border-white/10 flex flex-col z-40
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <span className="text-white text-xl font-bold tracking-tight">BlogO</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem icon={<Home className="w-4 h-4" />} label="Dashboard" active />
          <NavItem icon={<Archive className="w-4 h-4" />} label="Archive" />
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">BlogO User</p>
              <p className="text-white/40 text-[10px] truncate">user@blogo.app</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
        ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const [posts] = useState<Post[]>(makeSamplePosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeWeek, setActiveWeek] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Derived stats */
  const totalPosts = posts.length;
  const postedThisWeek = posts.filter((p) => {
    if (p.status !== "posted" || !p.scheduledDate) return false;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return p.scheduledDate >= weekAgo && p.scheduledDate <= now;
  }).length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  /* Calendar */
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

  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
    setActiveWeek(1);
  };

  return (
    <div className="min-h-screen bg-[#08060A] flex">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden mb-4 text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Hi Marko, what&apos;s the update?
            </h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#1F2933] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#263241] transition border border-[#1F2933]">
                <ChevronDown className="w-4 h-4" />
                {scheduledCount} Tweets
              </button>
              <GradientButton buttonLabel="Generate Tweets" className="px-4 py-2 text-sm" />
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard label="All Time Tweets" value={totalPosts} gradient="bg-[linear-gradient(135deg,#1a0f3d_0%,#2d1b69_100%)]" />
            <StatCard label="Tweeted This Week" value={postedThisWeek} gradient="bg-[linear-gradient(135deg,#2a1205_0%,#5c2a0a_100%)]" />
            <StatCard label="Scheduled Tweets" value={scheduledCount} gradient="bg-[linear-gradient(135deg,#0d1628_0%,#1a2d50_100%)]" />
          </div>

          {/* Calendar section */}
          <div className="mt-8">
            {/* Calendar controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* Month nav */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-medium text-sm min-w-[130px] text-center">{monthLabel}</span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Week tabs */}
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

            {/* Calendar grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((day, idx) => {
                    const isToday = dayKey(day) === dayKey(new Date());
                    return (
                      <div
                        key={idx}
                        className="bg-[#0F1419] rounded-t-lg p-3 text-center"
                      >
                        <p className={`font-semibold text-lg leading-none ${isToday ? "text-[#5C3FED]" : "text-white"}`}>
                          {day.getDate()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{DAY_NAMES[day.getDay()]}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Day content */}
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
                            className={`w-full text-left p-2 rounded-md transition-all hover:brightness-125 hover:scale-[1.02] ${platformCardBg(post.platform)}`}
                          >
                            <p className="text-white/50 text-[10px] mb-0.5">
                              {post.scheduledDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

      {/* X Card Modal */}
      {selectedPost && (
        <XCardModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                           */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className={`${gradient} rounded-xl p-5`}>
      <p className="text-gray-400 text-sm mb-3">{label}</p>
      <p className="text-white text-4xl font-bold">{value}</p>
    </div>
  );
}

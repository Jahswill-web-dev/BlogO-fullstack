"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Home,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Trash2,
  Info,
  Check,
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
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const FREQUENCIES = [
  { label: "Every 5 minutes",  minutes: 5 },
  { label: "Every 15 minutes", minutes: 15 },
  { label: "Every 30 minutes", minutes: 30 },
  { label: "Every hour",       minutes: 60 },
  { label: "Every 6 hours",    minutes: 360 },
  { label: "Every day",        minutes: 1440 },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CAL_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function ordinalDate(d: Date) {
  return `${ordinal(d.getDate())} ${d.toLocaleString("default", { month: "short" })}`;
}

function timeToHHMM(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const postCardBg = (status: Post["status"]) => {
  switch (status) {
    case "scheduled": return "bg-[#1a2638]";
    case "posted":    return "bg-[#0f2d1a]";
    case "draft":     return "bg-[#262626]";
  }
};

/* ------------------------------------------------------------------ */
/*  Mini Calendar (inside modal right panel)                            */
/* ------------------------------------------------------------------ */
function MiniCalendar({
  month,
  selected,
  onSelect,
  onMonthChange,
}: {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const today = new Date();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun

  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  // pad to full 6-row grid
  while (cells.length < 42) cells.push(null);

  const monthLabel = month.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => { const d = new Date(month); d.setMonth(d.getMonth() - 1); onMonthChange(d); }}
          className="p-1 text-white/50 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white font-medium text-sm">{monthLabel}</span>
        <button
          onClick={() => { const d = new Date(month); d.setMonth(d.getMonth() + 1); onMonthChange(d); }}
          className="p-1 text-white/50 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {CAL_HEADERS.map((h) => (
          <div key={h} className="text-center text-gray-500 text-xs py-1">{h}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isSelected = dayKey(cell) === dayKey(selected);
          const isToday = dayKey(cell) === dayKey(today);
          const inMonth = cell.getMonth() === month.getMonth();

          return (
            <button
              key={i}
              onClick={() => inMonth && onSelect(cell)}
              className={`w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full transition
                ${isSelected
                  ? "bg-[linear-gradient(135deg,#5C3FED,#B44BD6)] text-white font-semibold"
                  : isToday && inMonth
                  ? "text-[#5C3FED] font-semibold hover:bg-white/10"
                  : inMonth
                  ? "text-white hover:bg-white/10 cursor-pointer"
                  : "text-gray-600 cursor-default"
                }`}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit & Schedule Modal                                               */
/* ------------------------------------------------------------------ */
function EditScheduleModal({
  post,
  dayPosts,
  onClose,
  onSave,
}: {
  post: Post;
  dayPosts: Post[];
  onClose: () => void;
  onSave: (id: string, content: string, date: Date) => void;
}) {
  const [localPosts, setLocalPosts] = useState<Post[]>(dayPosts);
  const [activeId, setActiveId] = useState(post.id);
  const [editContent, setEditContent] = useState(post.content);
  const [modalMonth, setModalMonth] = useState(post.scheduledDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState(post.scheduledDate ?? new Date());
  const [startTime, setStartTime] = useState(post.scheduledDate ? timeToHHMM(post.scheduledDate) : "20:00");
  const [frequency, setFrequency] = useState("Every 5 minutes");

  const freqMinutes = FREQUENCIES.find((f) => f.label === frequency)?.minutes ?? 5;
  const totalMinutes = (localPosts.length - 1) * freqMinutes;
  const spanDays = Math.max(1, Math.ceil(totalMinutes / 1440));
  const endDate = new Date(selectedDate);
  endDate.setMinutes(endDate.getMinutes() + totalMinutes);

  const handleCardClick = (p: Post) => {
    setActiveId(p.id);
    setEditContent(p.content);
  };

  const handleDelete = (id: string) => {
    const remaining = localPosts.filter((p) => p.id !== id);
    setLocalPosts(remaining);
    if (id === activeId && remaining.length > 0) {
      setActiveId(remaining[0].id);
      setEditContent(remaining[0].content);
    }
  };

  const handleDone = () => {
    const [hh, mm] = startTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hh, mm, 0, 0);
    onSave(activeId, editContent, finalDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1419] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#2f3336] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/50 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold text-base sm:text-lg">Edit &amp; Schedule</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
            <Archive className="w-4 h-4" />
            Archive All
          </button>
          <GradientButton buttonLabel="Schedule Tweets" className="px-4 py-2 text-sm" onClick={handleDone} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — tweet list */}
        <div className="w-64 sm:w-72 flex-shrink-0 border-r border-[#2f3336] overflow-y-auto p-3 sm:p-4 space-y-3">
          {localPosts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              className={`relative p-4 rounded-xl border cursor-pointer transition
                ${activeId === p.id
                  ? "border-[#5C3FED] bg-[#5C3FED]/5"
                  : "border-[#2f3336] hover:border-white/20"
                }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                className="absolute top-2 right-2 text-red-400/60 hover:text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <p className="text-white/80 text-xs leading-snug line-clamp-5 pr-5 whitespace-pre-line">
                {p.content}
              </p>
            </div>
          ))}
        </div>

        {/* Center panel — editor */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent text-white text-base leading-relaxed resize-none outline-none placeholder:text-white/20"
            placeholder="Write your tweet..."
          />
        </div>

        {/* Right panel — scheduling */}
        <div className="hidden md:flex w-72 lg:w-80 flex-shrink-0 border-l border-[#2f3336] flex-col p-5 overflow-y-auto gap-5">
          {/* Calendar */}
          <MiniCalendar
            month={modalMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            onMonthChange={setModalMonth}
          />

          {/* Start time */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Select Start Time</label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#1F2933] text-white rounded-lg px-4 py-3 text-sm border border-[#2f3336] outline-none focus:border-[#5C3FED] transition appearance-none"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Posting Frequency</label>
            <div className="relative">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#1F2933] text-white rounded-lg px-4 py-3 text-sm border border-[#2f3336] outline-none appearance-none cursor-pointer"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.label} value={f.label}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Info box */}
          <div className="bg-[#0d1a2d] border border-[#1a3050] rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">
              Posting will span{" "}
              <strong className="text-white">{spanDays} {spanDays === 1 ? "day" : "days"}</strong>{" "}
              and end on{" "}
              <strong className="text-white">{ordinalDate(endDate)}</strong>
            </p>
          </div>

          {/* Done */}
          <div className="flex justify-end">
            <button
              onClick={handleDone}
              className="flex items-center gap-2 text-white text-sm hover:text-white/70 transition"
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>
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
          <Image src="/logo.svg" alt="HackrPost" width={118} height={21} priority />
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
              <p className="text-white text-xs font-medium truncate">HackrPost User</p>
              <p className="text-white/40 text-[10px] truncate">user@hackrpost.app</p>
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
  const [posts, setPosts] = useState<Post[]>(makeSamplePosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [activeWeek, setActiveWeek] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalPosts = posts.length;
  const postedThisWeek = posts.filter((p) => {
    if (p.status !== "posted" || !p.scheduledDate) return false;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return p.scheduledDate >= weekAgo && p.scheduledDate <= now;
  }).length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const weekDays = useMemo(() => getWeekDays(currentMonth, activeWeek), [currentMonth, activeWeek]);

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
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard label="All Time Tweets"   value={totalPosts}      gradient="bg-[linear-gradient(135deg,#1a0f3d_0%,#2d1b69_100%)]" />
            <StatCard label="Tweeted This Week" value={postedThisWeek}  gradient="bg-[linear-gradient(135deg,#2a1205_0%,#5c2a0a_100%)]" />
            <StatCard label="Scheduled Tweets"  value={scheduledCount}  gradient="bg-[linear-gradient(135deg,#0d1628_0%,#1a2d50_100%)]" />
          </div>

          {/* Calendar */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-medium text-sm min-w-[130px] text-center">{monthLabel}</span>
                <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-[#0F1419] rounded-lg p-1">
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className={`px-3 py-1.5 rounded-md text-sm transition ${activeWeek === w ? "bg-[#1F2933] text-white" : "text-white/50 hover:text-white"}`}
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
                      <div key={idx} className="bg-[#0F1419] rounded-t-lg p-3 text-center">
                        <p className={`font-semibold text-lg leading-none ${isToday ? "text-[#5C3FED]" : "text-white"}`}>
                          {day.getDate()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{DAY_NAMES[day.getDay()]}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, idx) => {
                    const key = dayKey(day);
                    const dayPosts = postsByDay[key] ?? [];
                    return (
                      <div key={idx} className="bg-[#0F1419] rounded-b-lg p-2 min-h-[200px] space-y-1.5">
                        {dayPosts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className={`w-full text-left p-2 rounded-md transition-all hover:brightness-125 hover:scale-[1.02] ${postCardBg(post.status)}`}
                          >
                            <p className="text-white/50 text-[10px] mb-0.5">
                              {post.scheduledDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p className="text-white/80 text-[11px] line-clamp-2 leading-snug">{post.content}</p>
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

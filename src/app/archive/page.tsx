"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardSidebar } from "@/components/modules/DashboardSidebar";
import {
  EditScheduleModal,
  Post,
  dayKey,
} from "@/components/modules/EditScheduleModal";

/* ------------------------------------------------------------------ */
/*  Sample archive data (posted tweets)                                 */
/* ------------------------------------------------------------------ */
function makeArchivePosts(): Post[] {
  // Use a fixed reference date so data is always visible regardless of current month
  const ref = new Date(2025, 0, 1); // January 2025
  const at = (day: number, hour = 20) =>
    new Date(ref.getFullYear(), ref.getMonth(), day, hour, 0, 0);

  return [
    { id: "a1",  content: "One thing I learned building a SaaS:\nYour first users don't care about your full roadmap.\nThey care about one painful problem you solve better than anything else.\nEverything else is noise.", platform: "Twitter", status: "posted", scheduledDate: at(12, 20) },
    { id: "a2",  content: "Most founders build in silence for too long.\nSharing your journey publicly — even the messy parts — compounds trust faster than any ad spend.", platform: "Twitter", status: "posted", scheduledDate: at(12, 14) },
    { id: "a3",  content: "The best growth lever for early SaaS: talk to your churned users.\nThey'll tell you exactly why you lost them. That's more valuable than any A/B test.", platform: "Twitter", status: "posted", scheduledDate: at(12, 10) },
    { id: "a4",  content: "Retention > acquisition.\nA leaky bucket never fills, no matter how much you pour in.", platform: "Twitter", status: "posted", scheduledDate: at(12, 8) },
    { id: "a5",  content: "Cold email still works in 2025 — but only if you lead with insight, not a pitch.\nResearch → Relevance → Result. In that order.", platform: "Twitter", status: "posted", scheduledDate: at(13, 20) },
    { id: "a6",  content: "Your pricing page is doing more selling than you think.\nMost visitors decide in <10 seconds. Make your value obvious instantly.", platform: "Twitter", status: "posted", scheduledDate: at(13, 14) },
    { id: "a7",  content: "We hit $10k MRR without a marketing budget.\nJust consistency: 1 post/day, 5 cold emails/day, 1 customer call/week. That's it.", platform: "Twitter", status: "posted", scheduledDate: at(13, 10) },
    { id: "a8",  content: "The fastest way to validate a SaaS idea:\nFind 5 people willing to pay before you write a single line of code.", platform: "Twitter", status: "posted", scheduledDate: at(13, 8) },
    { id: "a9",  content: "SEO compound interest is real.\nA post I wrote 18 months ago now drives 30% of our signups. Took 12 months to rank. Worth every day of patience.", platform: "Twitter", status: "posted", scheduledDate: at(14, 20) },
    { id: "a10", content: "Stop building features your customers never asked for.\nShip the boring thing first. Boring things that work beat clever things that don't.", platform: "Twitter", status: "posted", scheduledDate: at(14, 14) },
    { id: "a11", content: "The best onboarding shows value in under 60 seconds.\nIf your user doesn't get their 'aha moment' fast, they churn. No exception.", platform: "Twitter", status: "posted", scheduledDate: at(14, 10) },
    { id: "a12", content: "Product-market fit isn't a milestone — it's a feeling.\nWhen customers are more upset about potential loss than excited about potential gain, you're there.", platform: "Twitter", status: "posted", scheduledDate: at(14, 8) },
  ];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function longDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Tweet Card                                                          */
/* ------------------------------------------------------------------ */
function TweetCard({ content, date }: { content: string; date: Date }) {
  return (
    <div className="bg-[#111318] border border-white/[0.08] rounded-xl p-4 space-y-3 flex flex-col">
      {/* User row */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-semibold truncate">
              Avrg Indie
            </span>
            {/* Twitter verified badge */}
            <svg
              viewBox="0 0 24 24"
              aria-label="Verified account"
              className="w-4 h-4 flex-shrink-0"
              fill="#1D9BF0"
            >
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.91.2 3.92-.81s1.26-2.52.8-3.91C21.37 14.67 22.25 13.43 22.25 12zm-6.11-1.08l-3.9 4.8a.75.75 0 01-1.1.1l-2.1-2.1a.75.75 0 011.06-1.06l1.52 1.52 3.36-4.14a.75.75 0 011.16.94l-.0-.06z" />
            </svg>
          </div>
          <p className="text-white/40 text-xs">@hackrpost · {shortDate(date)}</p>
        </div>
      </div>
      {/* Content */}
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line flex-1">
        {content}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gradient border "Edit & Schedule" button                            */
/* ------------------------------------------------------------------ */
function EditScheduleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5 rounded-[4px] bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED] shadow-[5px_5px_7.4px_0px_#1E103538] flex-shrink-0"
    >
      <div className="bg-[#0F1419] hover:bg-[#151B22] transition rounded-[2px] px-4 py-2 text-white text-sm font-medium whitespace-nowrap">
        Edit &amp; Schedule
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Archive Page                                                        */
/* ------------------------------------------------------------------ */
export default function ArchivePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(2025, 0, 1) // start at Jan 2025 to match sample data
  );
  const [editGroup, setEditGroup] = useState<Post[] | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [authLoading, user, router]);

  // All posts (would come from API in production)
  const allPosts = useMemo(() => makeArchivePosts(), []);

  // Filter posts to current month, then group by day
  const groupedByDay = useMemo(() => {
    const filtered = allPosts.filter((p) => {
      if (!p.scheduledDate) return false;
      return (
        p.scheduledDate.getFullYear() === currentMonth.getFullYear() &&
        p.scheduledDate.getMonth() === currentMonth.getMonth()
      );
    });

    const map: Record<string, Post[]> = {};
    filtered.forEach((p) => {
      if (!p.scheduledDate) return;
      const key = dayKey(p.scheduledDate);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });

    // Sort keys chronologically
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allPosts, currentMonth]);

  if (authLoading) return <LoadingSpinner />;

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
  };

  return (
    <div className="min-h-screen bg-[#08060A] flex">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden mb-4 text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Heading */}
          <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-6">
            Archived Tweets
          </h1>

          {/* Month navigation */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-medium text-sm min-w-[130px] text-center bg-[#1F2933] px-4 py-2 rounded-lg">
              {monthLabel}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-lg bg-[#1F2933] text-white hover:bg-[#263241] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date groups */}
          {groupedByDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-white/40 text-base">
                No archived tweets for this month.
              </p>
              <p className="text-white/25 text-sm mt-1">
                Try navigating to a different month.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {groupedByDay.map(([key, posts]) => {
                const date = posts[0].scheduledDate!;
                return (
                  <section key={key}>
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white font-semibold text-lg">
                        {longDateLabel(date)}
                      </h2>
                      <EditScheduleButton
                        onClick={() => setEditGroup(posts)}
                      />
                    </div>

                    {/* 4-column tweet grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {posts.map((post) => (
                        <TweetCard
                          key={post.id}
                          content={post.content}
                          date={post.scheduledDate!}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit & Schedule Modal */}
      {editGroup && editGroup.length > 0 && (
        <EditScheduleModal
          post={editGroup[0]}
          dayPosts={editGroup}
          onClose={() => setEditGroup(null)}
          onSave={() => setEditGroup(null)}
        />
      )}
    </div>
  );
}

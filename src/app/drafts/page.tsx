"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarClock, FileText, Menu, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { api, ApiPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardSidebar } from "@/components/modules/DashboardSidebar";
import { EditScheduleModal, Post } from "@/components/modules/EditScheduleModal";

type DraftPost = Post & {
  createdAt?: Date;
  characterCount: number;
};

function getRawPosts(raw: unknown): ApiPost[] {
  if (Array.isArray(raw)) return raw as ApiPost[];
  if (raw && typeof raw === "object") {
    const container = raw as { posts?: unknown; data?: unknown };
    if (Array.isArray(container.posts)) return container.posts as ApiPost[];
    if (Array.isArray(container.data)) return container.data as ApiPost[];
  }
  return [];
}

function normalizeDraft(post: ApiPost): DraftPost | null {
  if (!post.finalPost?.trim()) return null;
  if (post.meta?.scheduled) return null;

  const status = (post.status ?? "draft").toLowerCase();
  if (status !== "draft") return null;

  const targetDate = post.targetDate ? new Date(post.targetDate) : undefined;
  const scheduledDate = post.scheduledDate
    ? new Date(post.scheduledDate)
    : targetDate;

  return {
    id: post._id,
    content: post.finalPost,
    platform: "Twitter",
    status: "draft",
    scheduledDate,
    targetDate,
    characterCount: post.finalPost.length,
  };
}

function formatDate(date?: Date) {
  if (!date || Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DraftTweetCard({
  post,
  authorName,
  handle,
  onEdit,
}: {
  post: DraftPost;
  authorName: string;
  handle: string;
  onEdit: (post: DraftPost) => void;
}) {
  const isLong = post.characterCount > 280;

  return (
    <article className="flex h-full flex-col rounded-lg border border-[#1F2933] bg-[#0F1419] p-4 transition hover:border-white/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)] text-sm font-semibold text-white">
            {authorName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {authorName}
              </p>
              <Image
                src="/x.svg"
                alt="X"
                width={14}
                height={14}
                className="flex-shrink-0 invert"
              />
            </div>
            <p className="truncate text-xs text-white/40">{handle}</p>
          </div>
        </div>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Draft
        </span>
      </div>

      <p className="min-h-[8rem] flex-1 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
        {post.content}
      </p>

      <div className="mt-5 border-t border-[#1F2933] pt-4">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(post.targetDate ?? post.scheduledDate)}
          </span>
          <span
            className={cn(
              "font-medium",
              isLong ? "text-[#E36A3A]" : "text-white/45"
            )}
          >
            {post.characterCount}/280
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEdit(post)}
          className="w-full rounded-md bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)] px-3 py-2 text-sm font-medium text-white shadow-[5px_5px_7.4px_0px_#1E103538] transition hover:shadow-[7px_7px_10px_0px_#1E103560]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <PenLine className="h-4 w-4" />
            Edit &amp; Schedule
          </span>
        </button>
      </div>
    </article>
  );
}

export default function DraftsPage() {
  const { user, isReady } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<DraftPost | null>(null);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    api
      .getPosts()
      .then((raw) => {
        if (cancelled) return;
        const nextDrafts = getRawPosts(raw)
          .map(normalizeDraft)
          .filter((post): post is DraftPost => post !== null)
          .sort((a, b) => {
            const aTime = (a.targetDate ?? a.scheduledDate)?.getTime() ?? 0;
            const bTime = (b.targetDate ?? b.scheduledDate)?.getTime() ?? 0;
            return bTime - aTime;
          });
        setDrafts(nextDrafts);
      })
      .catch((error) => {
        console.error("[Drafts] GET /posts failed:", error);
        toast.error("Could not load your drafts.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  const authorName = user?.name?.trim() || "HackrPost User";
  const handle = useMemo(() => {
    const source = user?.email?.split("@")[0] || authorName;
    return `@${source.toLowerCase().replace(/[^a-z0-9_]/g, "") || "hackrpost"}`;
  }, [authorName, user?.email]);

  const handleSchedule = async (id: string, content: string, date: Date) => {
    const previousDrafts = drafts;
    setDrafts((current) => current.filter((draft) => draft.id !== id));
    setSelectedDraft(null);

    try {
      const scheduled = await api.schedulePost(content, date.toISOString(), {
        platform: "Twitter",
      });
      await api.updatePost(id, {
        finalPost: content,
        meta: {
          scheduled: true,
          scheduledPostId: scheduled.post._id,
        },
      });
      toast.success("Draft scheduled for X.");
    } catch (error) {
      console.error("[Drafts] Schedule failed:", error);
      setDrafts(previousDrafts);
      toast.error("Could not schedule this draft. Please try again.");
    }
  };

  if (!isReady || loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-[#08060A]">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="min-h-screen flex-1 overflow-y-auto lg:ml-60">
        <div className="p-4 sm:p-6">
          <button
            type="button"
            className="mb-4 text-white/60 transition hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="mb-8 flex flex-col gap-4 border-b border-[#1F2933] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#1F2933] bg-[#0F1419] px-3 py-1 text-xs font-medium text-white/60">
                <FileText className="h-3.5 w-3.5" />
                X/Twitter drafts
              </p>
              <h1 className="font-ibm-plex-serif text-3xl font-semibold text-white sm:text-4xl">
                Drafts
              </h1>
            </div>
            <div className="rounded-lg border border-[#1F2933] bg-[#0F1419] px-4 py-3 text-sm text-white/60">
              <span className="font-semibold text-white">{drafts.length}</span>{" "}
              draft{drafts.length === 1 ? "" : "s"} ready to shape
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-lg border border-[#1F2933] bg-[#0F1419] px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)] text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                No drafts yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
                Generated posts that have not been scheduled will appear here as
                X-ready cards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {drafts.map((post) => (
                <DraftTweetCard
                  key={post.id}
                  post={post}
                  authorName={authorName}
                  handle={handle}
                  onEdit={setSelectedDraft}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedDraft && (
        <EditScheduleModal
          post={selectedDraft}
          dayPosts={[selectedDraft]}
          onClose={() => setSelectedDraft(null)}
          onSave={handleSchedule}
        />
      )}
    </div>
  );
}

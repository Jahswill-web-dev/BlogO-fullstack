"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Post } from "@/components/modules/EditScheduleModal";
import { AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* ------------------------------------------------------------------ */
/*  Status Pill                                                         */
/* ------------------------------------------------------------------ */
function StatusPill({ status }: { status: Post["status"] }) {
  const styles: Record<Post["status"], string> = {
    scheduled: "bg-[#EFF6FF] text-[#1D4ED8]",
    posted: "bg-[#F0FDF4] text-[#15803D]",
    draft: "bg-gray-100 text-gray-600",
  };
  const labels: Record<Post["status"], string> = {
    scheduled: "Scheduled",
    posted: "Posted",
    draft: "Draft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface DayPostsPopupProps {
  day: Date;
  posts: Post[];
  user: AuthUser | null;
  onClose: () => void;
  onPostClick: (post: Post) => void;
  onGenerateClick: () => void;
}

/* ------------------------------------------------------------------ */
/*  Inner content (shared between desktop modal + mobile sheet)        */
/* ------------------------------------------------------------------ */
function DayPostsContent({
  day,
  posts,
  onClose,
  onPostClick,
  onGenerateClick,
}: DayPostsPopupProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "0.5px solid #1F2933" }}
      >
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">
            {formatDayHeader(day)}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {posts.length === 0
              ? "No posts scheduled"
              : `${posts.length} post${posts.length !== 1 ? "s" : ""} scheduled`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0 ml-3"
          style={{
            width: 26,
            height: 26,
            background: "#1F2933",
            border: "0.5px solid #2f3336",
            borderRadius: 6,
            fontSize: 14,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* ── Post list ── */}
      <div className="overflow-y-auto scrollbar-popup flex-1 p-3 space-y-2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <p className="text-white/20 text-sm text-center leading-relaxed">
              No posts scheduled for this day.
            </p>
            <button
              onClick={() => {
                onClose();
                onGenerateClick();
              }}
              className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: "#5C3FED" }}
            >
              <Sparkles className="w-4 h-4" />
              Generate posts
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <button
              key={post.id}
              onClick={() => {
                onClose();
                onPostClick(post);
              }}
              className="w-full text-left p-3 rounded-xl border border-[#1F2933] hover:border-[#2f3336] transition-colors group"
              style={{ background: "#141920" }}
            >
              {/* Status + time row */}
              <div className="flex items-center gap-2 mb-2">
                <StatusPill status={post.status} />
                {post.scheduledDate && (
                  <span className="text-white/40 text-[11px] font-medium tabular-nums">
                    {formatTime(post.scheduledDate)}
                  </span>
                )}
              </div>

              {/* Content preview */}
              <p className="text-white/80 text-[13px] leading-snug line-clamp-3 whitespace-pre-line">
                {post.content}
              </p>

              {/* CTA */}
              <p
                className="text-[11px] font-medium mt-2.5 transition-opacity group-hover:opacity-80"
                style={{ color: "#1D9BF0" }}
              >
                View post →
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

/* ------------------------------------------------------------------ */
/*  DayPostsPopup                                                       */
/* ------------------------------------------------------------------ */
export function DayPostsPopup(props: DayPostsPopupProps) {
  const { onClose } = props;

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* ── Desktop: centered modal (≥768px) ── */}
      <motion.div
        key="day-posts-backdrop-desktop"
        className="hidden md:flex absolute inset-0 z-50 items-center justify-center"
        style={{ background: "rgba(0,0,0,0.4)" }}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[460px] mx-4 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "#0F1419",
            border: "0.5px solid #1F2933",
            maxHeight: "80vh",
          }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <DayPostsContent {...props} />
        </motion.div>
      </motion.div>

      {/* ── Mobile: bottom sheet (<768px) ── */}
      <motion.div
        key="day-posts-backdrop-mobile"
        className="md:hidden absolute inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.4)" }}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 overflow-hidden flex flex-col"
          style={{
            background: "#0F1419",
            border: "0.5px solid #1F2933",
            borderRadius: "16px 16px 0 0",
            maxHeight: "80vh",
          }}
          variants={sheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-[#1F2933]" />
          </div>
          <DayPostsContent {...props} />
        </motion.div>
      </motion.div>
    </>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Pencil,
} from "lucide-react";
import { Post } from "@/components/modules/EditScheduleModal";
import { AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatHeaderDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function formatScheduleDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function getHandle(user: AuthUser | null): string {
  if (!user) return "@user";
  return "@" + user.name.split(" ").join("_").toLowerCase();
}

function getInitial(user: AuthUser | null): string {
  if (!user?.name) return "U";
  return user.name.charAt(0).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  X logo SVG                                                          */
/* ------------------------------------------------------------------ */
function XLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
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
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
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
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface PostDetailPopupProps {
  post: Post;
  user: AuthUser | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onPostNow: (id: string) => void;
  onContentSave: (id: string, content: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Inner content — rendered inside either the desktop card or         */
/*  the mobile sheet (no outer wrapper, no extra border)               */
/* ------------------------------------------------------------------ */
function PopupContent({
  post,
  user,
  onClose,
  onEdit,
  onDelete,
  onPostNow,
  onContentSave,
}: PostDetailPopupProps) {
  const date = post.scheduledDate ?? new Date();
  const [draft, setDraft] = useState(post.content);
  const [focused, setFocused] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize();
  }, []);

  const commitSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== post.content.trim()) {
      onContentSave(post.id, draft);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }
  };

  const handleDelete = () => setConfirmingDelete(true);

  const confirmDelete = () => {
    onDelete(post.id);
    onClose();
  };

  const handlePostNow = () => {
    onPostNow(post.id);
    onClose();
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* ── Section 1: Header (pinned) ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "0.5px solid #1F2933" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <StatusPill status={post.status} />
          <span className="text-[12px] text-white/40 truncate">
            {formatHeaderDate(date)}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0 ml-2"
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

      {/* ── Section 2: Tweet preview (scrollable) ── */}
      <div className="overflow-y-auto scrollbar-popup min-h-0 flex-1 px-4 pt-4 pb-3">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#1D9BF0" }}
            >
              <span className="text-white text-sm font-bold leading-none">
                {getInitial(user)}
              </span>
            </div>
            {/* Name + handle */}
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight">
                {user?.name ?? "User"}
              </span>
              <span className="text-[12px] text-white/40 leading-tight">
                {getHandle(user)}
              </span>
            </div>
          </div>

          {/* X logo */}
          <span className="text-white" style={{ opacity: 0.35 }}>
            <XLogo size={16} />
          </span>
        </div>

        {/* Post body — inline editable */}
        <div className="relative -mx-2 group">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); autoResize(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); commitSave(); }}
            className={cn(
              "w-full text-white/90 bg-transparent resize-none outline-none rounded-lg px-2 py-1 transition-colors",
              focused
                ? "border border-[#2f3336]"
                : "border border-transparent hover:border-[#1F2933] cursor-text"
            )}
            style={{ fontSize: 14, lineHeight: 1.6, overflow: "hidden" }}
          />
          {/* Edit hint — shows on hover when not focused */}
          {!focused && !savedFlash && (
            <span className="absolute top-1 right-2 flex items-center gap-1 text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
              <Pencil size={9} />
              edit
            </span>
          )}
          {/* Saved confirmation — visible pill badge */}
          {savedFlash && (
            <span className="absolute bottom-1 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/15 text-green-400 border border-green-500/30 pointer-events-none select-none">
              ✓ Saved
            </span>
          )}
        </div>

        {/* Engagement row */}
        <div
          className="flex items-center mt-3 pt-3"
          style={{ borderTop: "0.5px solid #1F2933", gap: 18 }}
        >
          {(
            [
              { icon: <MessageCircle size={13} />, label: "Reply" },
              { icon: <Repeat2 size={13} />, label: "Repost" },
              { icon: <Heart size={13} />, label: "Like" },
              { icon: <BarChart2 size={13} />, label: "Analytics" },
            ] as const
          ).map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
            >
              {icon}
              <span className="text-[12px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 3: Schedule row (pinned) ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          borderTop: "0.5px solid #1F2933",
          borderBottom: "0.5px solid #1F2933",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon box */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 28,
              height: 28,
              background: "#1F2933",
              borderRadius: 8,
            }}
          >
            <CalendarDays size={13} className="text-white/60" />
          </div>

          {/* Date lines */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] text-white/40 leading-tight">
              Scheduled for
            </span>
            <span
              className="text-white leading-tight"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              {formatScheduleDate(date)}
            </span>
          </div>
        </div>

        {/* Reschedule button */}
        <button
          onClick={() => onEdit(post)}
          className="flex-shrink-0 ml-3 transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          style={{
            fontSize: 12,
            color: "#1D9BF0",
            border: "0.5px solid #1D9BF0",
            background: "transparent",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        >
          Reschedule
        </button>
      </div>

      {/* ── Section 4: Action bar / Delete confirmation ── */}
      {confirmingDelete ? (
        <div
          className="flex flex-col"
          style={{ padding: "14px 16px", gap: 10 }}
        >
          <p
            className="text-center text-white/80"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Delete this post? This can&apos;t be undone.
          </p>
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-white hover:opacity-80 transition-opacity"
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                background: "#1F2933",
                border: "1px solid #2f3336",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="text-white hover:opacity-90 transition-opacity"
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "#DC2626",
                border: "none",
              }}
            >
              Yes, delete
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center"
          style={{ padding: "12px 16px", gap: 8 }}
        >
          {/* Edit */}
          <button
            onClick={() => onEdit(post)}
            className="text-white hover:opacity-80 transition-opacity"
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              background: "#1F2933",
              border: "1px solid #2f3336",
            }}
          >
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="hover:opacity-80 transition-opacity"
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#DC2626",
              background: "#1F2933",
              border: "1px solid #2f3336",
            }}
          >
            Delete
          </button>

          {/* Post now */}
          <button
            onClick={handlePostNow}
            className="text-white hover:opacity-90 transition-opacity"
            style={{
              flex: 1.4,
              padding: "9px 0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              background: "#1D9BF0",
              border: "none",
            }}
          >
            Post now →
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PostDetailPopup                                                     */
/* ------------------------------------------------------------------ */
export function PostDetailPopup(props: PostDetailPopupProps) {
  const { onClose } = props;

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* ── Desktop: centered modal (>=768px) ── */}
      <motion.div
        key="detail-backdrop-desktop"
        className="hidden md:flex absolute inset-0 z-50 items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.4)",
          minHeight: 520,
        }}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "#0F1419",
            border: "0.5px solid #1F2933",
            maxHeight: "85vh",
          }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <PopupContent {...props} />
        </motion.div>
      </motion.div>

      {/* ── Mobile: bottom sheet (<768px) ── */}
      <motion.div
        key="detail-backdrop-mobile"
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
            maxHeight: "85vh",
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

          <PopupContent {...props} />
        </motion.div>
      </motion.div>
    </>
  );
}

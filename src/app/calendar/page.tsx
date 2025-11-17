"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

/* ----------------------------- Types ------------------------------ */
type ScheduledPost = {
    id: string;
    content: string;
    platform: "LinkedIn" | "Twitter" | "Instagram" | "Facebook" | string;
    scheduledDate: Date;
    posted?: boolean;
};

/* --------------------------- Constants ---------------------------- */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = 84; // px per hour row (used for virtualization)

/* ------------------------- Helper Utils -------------------------- */
function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}
function dayKey(date: Date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
function hourKey(date: Date) {
    return date.getHours(); // 0..23
}

/* --------------------------- Icons / UI --------------------------- */
const platformColorClass = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "linkedin":
            return "border-blue-600 bg-blue-50 text-blue-700";
        case "twitter":
        case "x":
            return "border-sky-500 bg-sky-50 text-sky-700";
        case "instagram":
            return "border-pink-500 bg-pink-50 text-pink-700";
        case "facebook":
            return "border-blue-700 bg-blue-50 text-blue-700";
        default:
            return "border-gray-400 bg-gray-50 text-gray-700";
    }
};
const platformDotClass = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "linkedin":
            return "bg-blue-600";
        case "twitter":
        case "x":
            return "bg-sky-500";
        case "instagram":
            return "bg-pink-500";
        case "facebook":
            return "bg-blue-700";
        default:
            return "bg-gray-600";
    }
};



/* ------------------------- Main Component ------------------------- */
export default function WeeklyScheduler({
    initialDate = new Date(),
    initialPosts = [],
}: {
    initialDate?: Date;
    initialPosts?: ScheduledPost[];
}) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState<Date>(initialDate);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // virtualization refs/state
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [visibleStart, setVisibleStart] = useState(0);
    const [visibleEnd, setVisibleEnd] = useState(8);
    
    // make sample posts live in the current week (Option A)
    const thisWeekStart = useMemo(() => startOfWeek(new Date()), []);
    const scheduledPosts: ScheduledPost[] = useMemo(() => {
        if (initialPosts && initialPosts.length > 0) {
            // normalize incoming posts' scheduledDate to Date if needed
            return initialPosts.map((p) => ({
                ...p,
                scheduledDate: new Date(p.scheduledDate),
            }));
        }

        // fallback sample posts positioned in the current week
        const makeDate = (dayOffset: number, hour: number, minute = 0) => {
            const d = new Date(thisWeekStart);
            d.setDate(thisWeekStart.getDate() + dayOffset);
            d.setHours(hour, minute, 0, 0);
            return d;
        };



        return [
            {
                id: "1",
                content:
                    "Excited to announce our new product launch! 🚀 We're revolutionizing the way startups connect with their audience.",
                platform: "LinkedIn",
                scheduledDate: makeDate(2, 10, 0), // Tue 10:00 (relative to week start)
                posted: false,
            },
            {
                id: "2",
                content:
                    "🎉 Big news! Our platform just hit 10,000 users! Thank you for believing in our vision.",
                platform: "Twitter",
                scheduledDate: makeDate(3, 14, 30), // Wed 14:30
                posted: false,
            },
            {
                id: "3",
                content:
                    "Behind the scenes at our startup! 📸 Meet the amazing team making it all happen.",
                platform: "Instagram",
                scheduledDate: makeDate(2, 16, 0), // Tue 16:00
                posted: true,
            },
            {
                id: "4",
                content: "New feature alert! 🎯 Check out what we just shipped.",
                platform: "LinkedIn",
                scheduledDate: makeDate(4, 9, 15), // Thu 9:15
                posted: false,
            },
        ];
    }, [initialPosts, thisWeekStart]);

    /* ------------------ Pre-group posts by day -> hour ------------------ */
    // group by dayKey -> hour -> array of posts
    const postsGrouped = useMemo(() => {
        const map = new Map<string, Map<number, ScheduledPost[]>>();
        for (const post of scheduledPosts) {
            const d = new Date(post.scheduledDate);
            const dKey = dayKey(d);
            const h = hourKey(d);
            if (!map.has(dKey)) map.set(dKey, new Map());
            const hourMap = map.get(dKey)!;
            if (!hourMap.has(h)) hourMap.set(h, []);
            hourMap.get(h)!.push(post);
        }
        // sort posts inside each hour by minutes (ascending)
        for (const [, hourMap] of map.entries()) {
            for (const [, arr] of hourMap.entries()) {
                arr.sort((a, b) => new Date(a.scheduledDate).getMinutes() - new Date(b.scheduledDate).getMinutes());
            }
        }
        return map;
    }, [scheduledPosts]);

    /* ---------------------- Week days calculation ---------------------- */
    const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
    const weekDays = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i);
                return d;
            }),
        [weekStart]
    );

    /* ------------------- Virtualization: visible rows ------------------ */
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const scrollTop = el.scrollTop;
            const containerHeight = el.clientHeight;
            const start = Math.floor(scrollTop / ROW_HEIGHT);
            const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + 1;
            setVisibleStart(Math.max(0, start - 1));
            setVisibleEnd(Math.min(HOURS.length - 1, start + visibleCount));
        };
        onScroll();
        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    /* --------------------------- Handlers ---------------------------- */
    const navigateWeek = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
        setCurrentDate(newDate);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };
    const handleOpenPost = (post: ScheduledPost) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };
    if (!isClient) {
        return <div>Loading calendar...</div>;
    }
    /* ---------------------------- Render ----------------------------- */
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/posts")}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigateWeek("prev")} className="p-2 hover:bg-gray-100 rounded" aria-label="Previous week">
                            <FaChevronLeft />
                        </button>

                        <div className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                            <div>
                                {weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
                                {weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-xs text-gray-500">{currentDate.toLocaleDateString(undefined, { year: "numeric" })}</div>
                        </div>

                        <button onClick={() => navigateWeek("next")} className="p-2 hover:bg-gray-100 rounded" aria-label="Next week">
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600">
                        <LegendItem color="bg-blue-600" label="LinkedIn" />
                        <LegendItem color="bg-sky-500" label="Twitter/X" />
                        <LegendItem color="bg-pink-500" label="Instagram" />
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Day headers */}
                    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-8 bg-gray-50 border-b border-gray-200">
                        <div className="p-3 text-xs font-medium text-gray-500" />
                        <div className="col-span-1 sm:col-span-7 overflow-x-auto">
                            <div className="min-w-full grid grid-cols-7">
                                {weekDays.map((day, idx) => {
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={idx} className="p-3 text-center border-l border-gray-200">
                                            <div className="text-xs font-medium text-gray-500 uppercase">{day.toLocaleDateString(undefined, { weekday: "short" })}</div>
                                            <div className={`text-lg font-semibold mt-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day.getDate()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* timeline (virtualized rows) */}
                    <div ref={scrollRef} className="max-h-[calc(100vh-220px)] overflow-y-auto" style={{ position: "relative" }}>
                        <div style={{ height: ROW_HEIGHT * HOURS.length + "px", position: "relative" }}>
                        {/* HOURS.slice(visibleStart, visibleEnd + 1) */}
                            {HOURS.map((hour, idx) => {
                                const rowIndex = visibleStart + idx;
                                const top = rowIndex * ROW_HEIGHT;
                                return (
                                    <div key={rowIndex} className="absolute left-0 right-0 grid grid-cols-[80px_1fr] sm:grid-cols-8 border-b border-gray-100" style={{ top, height: ROW_HEIGHT }}>
                                        {/* time label */}
                                        <div className="p-3 text-xs text-gray-500 font-medium">
                                            {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                                        </div>

                                        {/* day columns */}
                                        <div className="col-span-1 sm:col-span-7 overflow-hidden">
                                            <div className="min-w-full grid grid-cols-7 h-full">
                                                {weekDays.map((day) => {
                                                    const dKey = dayKey(day);
                                                    const hourMap = postsGrouped.get(dKey);
                                                    const postsThisSlot = hourMap?.get(hour) ?? [];

                                                    return (
                                                        <div key={`${dKey}-${hour}`} className="border-l border-gray-100 relative h-full">
                                                            {/* We position posts absolutely within this hour cell using minutes → top offset */}
                                                            {postsThisSlot.map((p, idx2) => {
                                                                const postDate = new Date(p.scheduledDate);
                                                                const minutes = postDate.getMinutes();
                                                                const minuteOffset = (minutes / 60) * ROW_HEIGHT;
                                                                // small vertical nudge per item so identical-minute posts don't perfectly overlap
                                                                const stackNudge = idx2 * 6;
                                                                const topPx = minuteOffset + stackNudge;
                                                                // slight horizontal offset if many posts (avoid full overlap)
                                                                const leftOffset = idx2 * 8;

                                                                return (
                                                                    <button
                                                                        key={p.id}
                                                                        onClick={() => handleOpenPost(p)}
                                                                        style={{
                                                                            position: "absolute",
                                                                            top: `${topPx}px`,
                                                                            left: `${4 + leftOffset}px`,
                                                                            right: "4px",
                                                                            zIndex: 10 + idx2,
                                                                        }}
                                                                        className={`p-2 rounded-md border-l-2 ${platformColorClass(p.platform)} hover:shadow-md transition-all cursor-pointer text-left max-w-[calc(100%-8px)]`}
                                                                    >
                                                                        <div className="flex items-center gap-1.5 mb-1">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${platformDotClass(p.platform)}`} />
                                                                            <span className="text-xs font-medium">
                                                                                {postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                            </span>
                                                                            {p.posted && <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 ml-auto" />}
                                                                        </div>
                                                                        <p className="text-xs line-clamp-2 leading-tight wrap-break-word">{p.content}</p>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Detail Modal */}
            {isModalOpen && selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold">Scheduled Post</h3>
                            <button onClick={() => { setIsModalOpen(false); setSelectedPost(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="mb-3 text-sm text-gray-700">
                            <div className="mb-2"><span className="font-medium">When: </span>{new Date(selectedPost.scheduledDate).toLocaleString()}</div>
                            <div className="mb-2"><span className="font-medium">Platform: </span>{selectedPost.platform}</div>
                            <div className="mb-2"><span className="font-medium">Content:</span><p className="mt-1 text-sm text-gray-600">{selectedPost.content}</p></div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setIsModalOpen(false); setSelectedPost(null); }} className="px-3 py-2 border rounded text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* --------------------------- Small pieces ------------------------- */

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`${color} w-2 h-2 rounded-full`} />
            <span>{label}</span>
        </div>
    );
}

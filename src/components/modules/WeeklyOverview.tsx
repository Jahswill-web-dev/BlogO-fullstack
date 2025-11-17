"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarPost = {
  id: string;
  content: string;
  platform: string;
  scheduledDate: string; // ISO string
  posted: boolean;
};


export default function WeeklyOverview({ posts }: { posts: CalendarPost[] }) {
    const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);


  // Helper: local yyyy-mm-dd
  const dayKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Get the current week's Monday
  const today = new Date();
  const weekStart = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday fix
  weekStart.setDate(today.getDate() + diff);

  // Generate array of 7 days for display
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Group posts by local date
  const postsByDay = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};
    posts.forEach((p) => {
      const localDate = new Date(p.scheduledDate);
      const key = dayKey(localDate);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });

    // sort posts by time
    Object.values(map).forEach((list) => {
      list.sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );
    });

    return map;
  }, [posts]);

  const platformColor = (platform: string) => {
    switch (platform) {
      case "LinkedIn":
        return "bg-blue-200 border-blue-600 text-blue-900";
      case "X":
        return "bg-purple-200 border-purple-600 text-purple-900";
      case "Instagram":
        return "bg-red-200 border-red-600 text-red-900";
      default:
        return "bg-gray-200 border-gray-500 text-gray-900";
    }
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
if (!mounted) {
  return <div>Loading...</div>; // or skeleton loader
}
  return (
    <div className="grid grid-cols-7 gap-1 w-full h-[600px] border rounded-lg overflow-hidden">
      {weekDays.map((date, idx) => {
        const key = dayKey(date);
        const list = postsByDay[key] || [];

        return (
          <div key={key} className="border-r last:border-none flex flex-col">
            {/* Day header */}
            <div className="p-2 text-center font-semibold bg-gray-50 border-b">
              {dayNames[idx]} <br />
              <span className="text-xs text-gray-500">
                {date.getDate()}/{date.getMonth() + 1}
              </span>
            </div>

            {/* Posts */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {list.length === 0 && (
                <div className="text-xs text-gray-400 text-center">—</div>
              )}

              {list.map((post) => {
                const t = new Date(post.scheduledDate);
                const time = t.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={post.id}
                    className={`p-2 rounded-md border text-xs shadow-sm ${platformColor(
                      post.platform
                    )}`}
                  >
                    <div className="font-medium">{time}</div>
                    <div className="line-clamp-2">{post.content}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}







// "use client";

// import { useMemo } from "react";

// type CalendarPost = {
//     id: string;
//     content: string;
//     platform: string;
//     scheduledDate: string; // ISO string
//     posted: boolean;
// };

// export default function WeeklyOverview({ posts }: { posts: CalendarPost[] }) {
//     // Helper: local yyyy-mm-dd
//     const dayKey = (date: Date) => {
//         const y = date.getFullYear();
//         const m = String(date.getMonth() + 1).padStart(2, "0");
//         const d = String(date.getDate()).padStart(2, "0");
//         return `${y}-${m}-${d}`;
//     };

//     // Get the current week's Monday
//     const today = new Date();
//     const weekStart = new Date(today);
//     const day = today.getDay();
//     const diff = day === 0 ? -6 : 1 - day; // Sunday fix
//     weekStart.setDate(today.getDate() + diff);

//     // Generate array of 7 days for display
//     const weekDays = Array.from({ length: 7 }).map((_, i) => {
//         const d = new Date(weekStart);
//         d.setDate(weekStart.getDate() + i);
//         return d;
//     });

//     // Group posts by local date
//     const postsByDay = useMemo(() => {
//         const map: Record<string, CalendarPost[]> = {};
//         posts.forEach((p) => {
//             const localDate = new Date(p.scheduledDate);
//             const key = dayKey(localDate);
//             if (!map[key]) map[key] = [];
//             map[key].push(p);
//         });

//         // sort posts by time
//         Object.values(map).forEach((list) => {
//             list.sort(
//                 (a, b) =>
//                     new Date(a.scheduledDate).getTime() -
//                     new Date(b.scheduledDate).getTime()
//             );
//         });

//         return map;
//     }, [posts]);

//     const platformColor = (platform: string) => {
//         switch (platform) {
//             case "LinkedIn":
//                 return "bg-blue-200 border-blue-600 text-blue-900";
//             case "X":
//                 return "bg-purple-200 border-purple-600 text-purple-900";
//             case "Instagram":
//                 return "bg-red-200 border-red-600 text-red-900";
//             default:
//                 return "bg-gray-200 border-gray-500 text-gray-900";
//         }
//     };

//     const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//     return (
//         <div className="grid grid-cols-7 gap-1 w-full h-[600px] border rounded-lg overflow-hidden">
//             {weekDays.map((date, idx) => {
//                 const key = dayKey(date);
//                 const list = postsByDay[key] || [];

//                 return (
//                     <div key={key} className="border-r last:border-none flex flex-col">
//                         {/* Day header */}
//                         <div className="p-2 text-center font-semibold bg-gray-50 border-b">
//                             {dayNames[idx]} <br />
//                             <span className="text-xs text-gray-500">
//                                 {date.getDate()}/{date.getMonth() + 1}
//                             </span>
//                         </div>

//                         {/* Posts */}
//                         <div className="flex-1 overflow-y-auto p-2 space-y-2">
//                             {list.length === 0 && (
//                                 <div className="text-xs text-gray-400 text-center">—</div>
//                             )}

//                             {list.map((post) => {
//                                 const t = new Date(post.scheduledDate);
//                                 const time = t.toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                 });

//                                 return (
//                                     <div
//                                         key={post.id}
//                                         className={`p-2 rounded-md border text-xs shadow-sm ${platformColor(
//                                             post.platform
//                                         )}`}
//                                     >
//                                         <div className="font-medium">{time}</div>
//                                         <div className="line-clamp-2">{post.content}</div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

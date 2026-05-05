"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Home, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { api, AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  NavItem                                                             */
/* ------------------------------------------------------------------ */
function NavItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const pathname = usePathname();
  const active = href ? pathname === href : false;

  const classes = `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
    ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button className={classes}>
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
export function DashboardSidebar({
  mobileOpen,
  onClose,
  user,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}) {
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      setProfileMenuOpen(false);
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await api.logout();
      setProfileMenuOpen(false);
      onClose();
      router.replace("/signin");
    } catch {
      toast.error("Could not log you out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#08060A] border-r border-white/10 flex flex-col z-40
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <Image
            src="/logo.svg"
            alt="HackrPost"
            width={118}
            height={21}
            priority
          />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem
            icon={<Home className="w-4 h-4" />}
            label="Dashboard"
            href="/dashboard"
          />
          <NavItem
            icon={<FileText className="w-4 h-4" />}
            label="Drafts"
            href="/drafts"
          />
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" href="/settings" />
          <div className="relative mt-2" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-xl border border-[#1F2933] bg-[#0F1419] p-1 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition-colors",
                    logoutLoading
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-white/5 focus-visible:bg-white/5"
                  )}
                >
                  <LogOut className="h-4 w-4 text-[#d6ccff]" />
                  <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/5 focus-visible:bg-white/5"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)] flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {user?.name ?? "HackrPost User"}
                </p>
                <p className="text-white/40 text-[10px] truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Archive, Settings } from "lucide-react";
import { AuthUser } from "@/lib/api";

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
            icon={<Archive className="w-4 h-4" />}
            label="Archive"
            href="/archive"
          />
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.name ?? "HackrPost User"}
              </p>
              <p className="text-white/40 text-[10px] truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

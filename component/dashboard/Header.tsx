"use client";

import { useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { useUserStore } from "@/app/store/userStore";
import { useOrgStore } from "@/app/store/org-store";
import { LuClipboardList, LuMenu, LuX } from "react-icons/lu";
import NotificationBell from "@/component/dashboard/NotificationBell";

interface HeaderProps {
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export default function Header({
  mobileMenuOpen,
  onMobileMenuToggle,
}: HeaderProps) {
  const { data: session } = authClient.useSession();
  const { data: activeMember } = authClient.useActiveMember();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const setActiveOrg = useOrgStore((state) => state.setActiveOrg);
  const setUser = useUserStore((state) => state.setUser);
  const storedUser = useUserStore((state) => state.user);
  const setRole = useUserStore((state) => state.setRole);

  useEffect(() => {
    setActiveOrg(activeOrg);
  }, [activeOrg, setActiveOrg]);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }

    if (activeMember?.role) {
      setRole(activeMember.role);
    }
  }, [session, activeMember, setUser, setRole]);

  const rawName =
    session?.user?.name?.trim() || storedUser?.name?.trim() || "";

  const validName =
    rawName && !/^loading(?:\.{0,3})?$/i.test(rawName) ? rawName : "";

  const userName =
    validName ||
    session?.user?.email?.split("@")[0] ||
    storedUser?.email?.split("@")[0] ||
    "Account";

  const userImage = session?.user?.image || storedUser?.image;
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = activeMember?.role || "Member";

  return (
    <header className="relative z-40 flex min-h-[64px] w-full shrink-0 items-center justify-between gap-2 border-b-2 border-neutral-200/60 bg-white px-3 py-3 sm:px-6">
      {/* Workspace label */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2 text-sm text-slate-600 sm:px-3">
          <LuClipboardList
            size={17}
            className="shrink-0 text-blue-600"
          />
          <span className="truncate font-medium">Claims workspace</span>
          <span className="hidden text-slate-400 md:inline">/</span>
          <span className="hidden text-slate-500 lg:inline">
            Review and manage submissions
          </span>
        </div>
      </div>

      {/* Mobile menu, notifications and profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">


        <NotificationBell />

        <div className="h-6 w-px shrink-0 bg-neutral-200" />

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E1F5FE]">
            {userImage ? (
              <img
                src={userImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-instrument text-base font-bold text-[#0288D1]">
                {userInitial}
              </span>
            )}
          </div>

          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="max-w-[110px] truncate font-instrument text-xs font-semibold text-neutral-600 sm:max-w-[180px] sm:text-sm">
              {userName}
            </span>
            <span className="font-instrument text-[11px] font-semibold capitalize text-blue-600">
              {userRole}
            </span>
          </div>
        </div>

        <div className="h-6 w-px shrink-0 bg-neutral-200" />

        <button
          type="button"
          aria-label={
            mobileMenuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={mobileMenuOpen}
          onClick={onMobileMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border  border-slate-200 bg-white text-slate-700  transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
        >
          {mobileMenuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </div>
    </header>
  );
}

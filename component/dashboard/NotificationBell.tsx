"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuBell,
  LuCheckCheck,
  LuClipboardList,
  LuExternalLink,
  LuLoaderCircle,
} from "react-icons/lu";
type Notification = {
  id: string;
  claimId: string;
  claimNumber: string;
  action: string;
  details: string | null;
  createdAt: string;
  actorName: string | null;
  status: string;
};
function label(n: Notification) {
  const action = n.action.replace(/[_-]/g, " ").toLowerCase();
  return action.charAt(0).toUpperCase() + action.slice(1);
}
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setItems(d.notifications || []);
      }
    } catch (e) {
      console.error("Could not load notifications", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setLastSeen(localStorage.getItem("autoclaim-notifications-seen"));
    void load();
    const id = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);
  const unread = items.filter(
    (n) =>
      !lastSeen ||
      new Date(n.createdAt).getTime() > new Date(lastSeen).getTime(),
  ).length;
  function markRead() {
    const now = new Date().toISOString();
    localStorage.setItem("autoclaim-notifications-seen", now);
    setLastSeen(now);
  }
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            void load();
            markRead();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
      >
        <LuBell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="
  fixed
  left-3 right-3
  top-16
  z-[100]
  w-auto
  max-h-[calc(100dvh-6rem)]
  overflow-y-auto
  rounded-xl
  bg-white
  shadow-xl
  sm:absolute
  sm:left-auto
  sm:right-0
  sm:top-full
  sm:mt-3
  sm:w-96
  sm:max-h-[min(80vh,40rem)]
  border border-neutral-300/60
">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                Recent claim activity in your workspace
              </p>
            </div>
            <button
              type="button"
              onClick={markRead}
              title="Mark all as read"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
            >
              <LuCheckCheck size={18} />
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                <LuLoaderCircle className="animate-spin" />
                Loading notifications…
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center text-slate-500">
                <LuBell size={24} />
                <p className="text-sm font-medium">You’re all caught up</p>
                <p className="text-xs">Claim updates will appear here.</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(
                      `/dashboard/${window.location.pathname.includes("reviewer") ? "reviewer" : "admin"}?tab=claims&claim=${encodeURIComponent(n.claimId)}`,
                    );
                  }}
                  className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <LuClipboardList size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <strong className="text-sm font-semibold text-slate-800">
                        {label(n)}
                      </strong>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      Claim {n.claimNumber}
                      {n.actorName ? ` · ${n.actorName}` : ""}
                    </span>
                    {n.details && (
                      <span className="mt-1 block line-clamp-2 text-xs text-slate-500">
                        {n.details}
                      </span>
                    )}
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      View claim <LuExternalLink size={12} />
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-[11px] text-slate-500">
            Refreshes automatically every 30 seconds
          </div>
        </div>
      )}
    </div>
  );
}

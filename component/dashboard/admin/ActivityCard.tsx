"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Activity = { id: string; action: string; details: string | null; createdAt: string; actorName: string | null };
function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}
export default function ActivityCard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => { fetch("/api/claims/activity", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => { if (data) setActivities(data.activities || []); }).catch((error) => console.error("Could not load claim activity", error)); }, []);
  return <div className="flex w-full min-w-[280px] flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6"><h2 className="text-base font-bold text-[#0F172A]">Recent Activity</h2><div className="flex flex-col gap-3.5">{activities.length === 0 ? <p className="text-sm text-slate-500">Claim submissions and reviewer decisions will appear here.</p> : activities.map((activity) => <div key={activity.id} className="flex items-start gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]"><Image src={activity.action.toLowerCase().includes("submitted") ? "/icons/file.svg" : activity.action.toLowerCase().includes("reject") ? "/icons/alert-circle.svg" : "/icons/check-circle.svg"} alt="Activity" width={14} height={14}/></div><div className="min-w-0"><p className="text-[13px] font-medium leading-tight text-[#0F172A]">{activity.action}</p>{activity.details && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{activity.details}</p>}<p className="mt-1 text-[11px] text-[#94A3B8]">{activity.actorName ? `${activity.actorName} · ` : ""}{relativeTime(activity.createdAt)}</p></div></div>)}</div></div>;
}

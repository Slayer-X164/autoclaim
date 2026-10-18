"use client";

import { useEffect, useState } from "react";
import InviteModal from "@/component/dashboard/admin/InviteModal";

type Reviewer = { id: string; name: string; email: string; role: string; pending: number };
export default function ReviewersCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  useEffect(() => { fetch("/api/workspace/members", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => { if (data) setReviewers((data.members || []).filter((member: Reviewer) => member.role === "reviewer").slice(0, 4)); }).catch((error) => console.error("Could not load reviewers", error)); }, []);
  return <>
    <div className="flex w-full min-w-[280px] flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-base font-bold text-[#0F172A]">Reviewers</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{reviewers.length}</span></div>
      <div className="flex w-full flex-col gap-3">{reviewers.length === 0 ? <p className="text-sm text-slate-500">No reviewers yet. Invite a teammate to start reviewing claims.</p> : reviewers.map((reviewer) => <div key={reviewer.id} className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#475569]">{reviewer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#0F172A]">{reviewer.name}</p><p className="truncate text-xs text-[#64748B]">{reviewer.email}</p></div><span className="whitespace-nowrap text-xs text-[#64748B]">{reviewer.pending} pending</span></div>)}</div>
      <button onClick={() => setIsModalOpen(true)} className="w-fit cursor-pointer pt-1 text-sm font-semibold text-[#1F66FF] hover:text-[#1554D6]">+ Invite Reviewer</button>
    </div>
    <InviteModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetch("/api/workspace/members", { cache: "no-store" }).then((response) => response.json()).then((data) => setReviewers((data.members || []).filter((member: Reviewer) => member.role === "reviewer").slice(0, 4))).catch(() => undefined); }} />
  </>;
}

"use client";

import { useEffect, useState } from "react";
import {
  LuFiles,
  LuClock,
  LuCircleCheck,
  LuTriangleAlert,
  LuShieldCheck,
} from "react-icons/lu";
import { useUserStore } from "@/app/store/userStore";
import ClaimQueue from "@/component/dashboard/ClaimQueue";
import CustomerInvitationsCard from "@/component/dashboard/admin/CustomerInvitationsCard";

type Summary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  autoApproved: number;
  reviewers: number;
  completedToday: number;
};
const emptySummary: Summary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  processing: 0,
  autoApproved: 0,
  reviewers: 0,
  completedToday: 0,
};

export default function ReviewerDashboard() {
  const user = useUserStore((state) => state.user);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  useEffect(() => {
    fetch("/api/claims/summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch((error) =>
        console.error("Could not load reviewer summary", error),
      );
  }, []);
  const cards = [
    {
      label: "Total Claims",
      value: summary.total,
      icon: LuFiles,
      tint: "bg-blue-50 text-[#1F66FF]",
    },
    {
      label: "Pending Review",
      value: summary.pending,
      icon: LuClock,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved",
      value: summary.approved + summary.autoApproved,
      icon: LuCircleCheck,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected",
      value: summary.rejected,
      icon: LuTriangleAlert,
      tint: "bg-red-50 text-red-600",
    },
  ];
  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#0F172A]">Overview</h1>
        <p className="mt-1 text-sm text-[#475569]">
          Welcome{user?.name ? `, ${user.name}` : " back"}. Here is your
          organization&apos;s live claim queue.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {card.label}
                </span>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.tint}`}
                >
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-[#0F172A]">
                {card.value}
              </p>
              
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 md:col-span-2">
          <div className="flex items-center gap-2">
            <LuShieldCheck className="text-[#1F66FF]" />
            <h2 className="font-bold">Review priorities</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open a claim to inspect uploaded evidence, read AI triage findings
            and risk flags, and record your decision. AI suggestions are
            advisory; the reviewer makes the final decision.
          </p>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-slate-500">Completed today</p>
          <p className="mt-2 text-3xl font-bold">{summary.completedToday}</p>
          <p className="mt-1 text-xs text-slate-400">
            Claims with a recorded decision
          </p>
        </div>
      </div>
      <CustomerInvitationsCard />
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <ClaimQueue compact />
      </div>
    </div>
  );
}

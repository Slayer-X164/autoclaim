"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClaimQueue from "@/component/dashboard/ClaimQueue";
import { useUserStore } from "@/app/store/userStore";
import CenterLoader from "@/component/CenterLoader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

import KpiCard from "@/component/dashboard/admin/KpiCard";
import RecentClaimsTable from "@/component/dashboard/admin/RecentClaimsTable";
import ReviewersCard from "@/component/dashboard/admin/ReviewersCard";
import ActivityCard from "@/component/dashboard/admin/ActivityCard";
import CustomerInvitationsCard from "@/component/dashboard/admin/CustomerInvitationsCard";
import AdminReviewersPage from "@/component/dashboard/admin/AdminReviewersPage";
import AdminSettingsPage from "@/component/dashboard/admin/AdminSettingsPage";
import { LuCircleCheck, LuClock, LuFiles, LuUsers } from "react-icons/lu";

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

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    autoApproved: 0,
    reviewers: 0,
    completedToday: 0,
  });
  useEffect(() => {
    fetch("/api/claims/summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch((error) =>
        console.error("Could not load dashboard summary", error),
      );
  }, []);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { data: activeMember, isPending: isMemberPending } =
    authClient.useActiveMember();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session, setUser]);

  useEffect(() => {
    if (!isSessionPending && !isMemberPending) {
      if (
        activeMember &&
        activeMember.role !== "admin" &&
        activeMember.role !== "owner"
      ) {
        router.replace("/dashboard/reviewer");
      }
    }
  }, [activeMember, isSessionPending, isMemberPending, router]);

  if (isSessionPending || isMemberPending) {
    return <CenterLoader text="Loading your workspace..." />;
  }

  if (tab === "claims") return <ClaimQueue />;
  if (tab === "reviewers") return <AdminReviewersPage />;
  if (tab === "settings") return <AdminSettingsPage />;

  return (
    <div className="dashboard-content flex min-w-0 flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-instrument font-bold text-[28px] text-[#0F172A]">
          Overview
        </h1>
        <p className="font-instrument font-regular text-[14px] text-[#475569]">
          Here&apos;s how your organization&apos;s claims operation is doing.
        </p>

      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5">
        <KpiCard
          title="Total Claims"
          value={summary.total}
          icon={LuFiles}
          tint="bg-blue-50 text-[#1F66FF]"
        />
        <KpiCard
          title="Pending Review"
          value={summary.pending}
          icon={LuClock}
          tint="bg-amber-50 text-amber-600"
        />
        <KpiCard
          title="Completed Claims"
          value={summary.approved + summary.rejected + summary.autoApproved}
          icon={LuCircleCheck}
          tint="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          title="Active Reviewers"
          value={summary.reviewers}
          icon={LuUsers}
          tint="bg-violet-50 text-violet-600"
        />
      </div>

      <CustomerInvitationsCard />

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] xl:gap-6">
        <RecentClaimsTable />
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <ReviewersCard />
          <ActivityCard />
        </div>
      </div>
    </div>
  );
}

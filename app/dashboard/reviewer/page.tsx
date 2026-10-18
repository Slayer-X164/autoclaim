"use client"
import { useEffect, Suspense } from "react";
import { authClient } from "@/app/lib/auth-client";
import { useUserStore } from "@/app/store/userStore";
import CenterLoader from "@/component/CenterLoader";
import { useRouter, useSearchParams } from "next/navigation";
import ClaimsList from "@/component/dashboard/reviewer/ClaimsList";
import Settings from "@/component/dashboard/reviewer/Settings";
import ReviewerDashboard from "@/component/dashboard/reviewer/ReviewerDashboard";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data: activeMember, isPending: isMemberPending } = authClient.useActiveMember();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const { data: orgs, isPending: isOrgPending } = authClient.useListOrganizations();
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session, setUser]);

  useEffect(() => {
    if (!isSessionPending && !isMemberPending) {
      // If there is an active member and they are an admin/owner, redirect them
      if (activeMember && (activeMember.role === "admin" || activeMember.role === "owner")) {
        router.replace("/dashboard/admin");
      }
    }
  }, [activeMember, isSessionPending, isMemberPending, router]);

  if (isSessionPending || isMemberPending) {
    return <CenterLoader text="Loading your workspace..." />;
  }

  if (tab === "claims") {
    return (
      <Suspense fallback={<CenterLoader text="Loading claims..." />}>
        <ClaimsList />
      </Suspense>
    );
  }

  if (tab === "settings") {
    return (
      <Suspense fallback={<CenterLoader text="Loading settings..." />}>
        <Settings />
      </Suspense>
    );
  }

  return <ReviewerDashboard />;
}


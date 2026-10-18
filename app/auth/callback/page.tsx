"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import CenterLoader from "@/component/CenterLoader";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (!sessionPending && !orgsPending) {
      if (!session) {
        router.replace("/");
        return;
      }

      if (orgs && orgs.length > 0) {
        // User has an organization, let's set it as active and redirect to dashboard
        authClient.organization.setActive({ organizationId: orgs[0].id }).then(async () => {
          const res = await authClient.organization.getActiveMember();
          if (res.data && res.data.role === "reviewer") {
            router.replace("/dashboard/reviewer");
          } else {
            router.replace("/dashboard/admin"); 
          }
        });
      } else {
        // No organization, go to onboarding
        router.replace("/onboarding");
      }
    }
  }, [session, orgs, sessionPending, orgsPending, router]);

  return <CenterLoader text="Authenticating..." />;
}

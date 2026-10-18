"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import CenterLoader from "@/component/CenterLoader";

function InvitationCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitationId");
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (!sessionPending) {
      if (!session) {
        // If the session failed to establish, go to home
        router.replace("/");
        return;
      }

      if (invitationId) {
        // Accept the invitation
        authClient.organization.acceptInvitation({ invitationId }).then((res) => {
          if (res.error) {
            console.error("Error accepting invitation", res.error);
          }
          // The invitation acceptance usually updates the active organization behind the scenes.
          // Redirect to the reviewer dashboard.
          router.replace("/dashboard/reviewer");
        }).catch((err) => {
          console.error("Failed to accept invitation", err);
          router.replace("/dashboard/reviewer");
        });
      } else {
        // Fallback if no invitationId is found
        router.replace("/auth/callback");
      }
    }
  }, [session, sessionPending, invitationId, router]);

  return <CenterLoader text="Accepting your invitation..." />;
}

export default function InvitationCallbackPage() {
  return (
    <Suspense fallback={<CenterLoader text="Loading..." />}>
      <InvitationCallbackHandler />
    </Suspense>
  );
}

import ClaimSubmissionPortal from "../../[orgSlug]/portal";

export default async function InvitedClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClaimSubmissionPortal orgSlug="" invitationToken={token} />;
}

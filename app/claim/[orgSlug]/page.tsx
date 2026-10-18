import ClaimSubmissionPortal from "./portal";

export default async function PublicClaimPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  return <ClaimSubmissionPortal orgSlug={orgSlug} />;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuSearch, LuX, LuFileText, LuShieldCheck, LuTriangleAlert, LuRefreshCw } from "react-icons/lu";

type ClaimRow = {
  id: string; claimNumber: string; customerName: string; customerEmail: string; vehicleMake: string;
  vehicleModel: string; vehicleYear: number; status: string; aiConfidence: number | null;
  aiRecommendation: string | null; createdAt: string; reviewerId: string | null; reviewerName?: string | null; reviewerEmail?: string | null;
};
type ClaimDetail = ClaimRow & {
  registrationNumber: string; accidentDate: string; incidentDescription: string; aiSummary: string | null;
  riskFlags: string[]; reviewerNotes: string | null;
};
type Evidence = { id: string; fileName: string; mimeType: string; fileSize: number; kind: string; dataUrl: string };
type Reviewer = { userId: string; name: string; email: string; role: string };
type EvidenceRequest = { id: string; description: string; expiresAt: string; fulfilledAt: string | null; createdAt: string };
const statuses = ["All", "Processing", "Needs Review", "Approved", "Rejected", "Auto Approved"];
const statusStyles: Record<string, string> = {
  Processing: "bg-blue-50 text-blue-700 border-blue-200", "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200", Rejected: "bg-red-50 text-red-700 border-red-200",
  "Auto Approved": "bg-violet-50 text-violet-700 border-violet-200",
};

export default function ClaimQueue({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  useEffect(() => { setSearch(searchParams.get("q") || ""); }, [searchParams]);
  const [selected, setSelected] = useState<ClaimDetail | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [canAssign, setCanAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [evidenceRequestText, setEvidenceRequestText] = useState("");
  const [evidenceRequests, setEvidenceRequests] = useState<EvidenceRequest[]>([]);
  const [requestingEvidence, setRequestingEvidence] = useState(false);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "All") params.set("status", status);
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(`/api/claims?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load claims");
      setClaims(data.claims || []);
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load claims"); }
    finally { setLoading(false); }
  }, [status, search]);
  useEffect(() => { const timer = setTimeout(() => { void loadClaims(); }, 180); return () => clearTimeout(timer); }, [loadClaims]);
  useEffect(() => { fetch("/api/workspace/members", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { setReviewers((d?.members || []).filter((m: Reviewer) => m.role === "reviewer")); setCanAssign(d?.currentRole === "admin" || d?.currentRole === "owner"); }).catch(() => { setReviewers([]); setCanAssign(false); }); }, []);

  async function openClaim(row: ClaimRow) {
    setSelected(null); setEvidence([]); setDetailLoading(true); setNotes(""); setError("");
    try {
      const response = await fetch(`/api/claims/${row.id}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to open claim");
      setSelected(data.claim); setEvidence(data.evidence || []); setNotes(data.claim.reviewerNotes || "");
      const requestResponse = await fetch(`/api/claims/${row.id}/evidence-requests`, { cache: "no-store" });
      const requestData = await requestResponse.json().catch(() => ({}));
      setEvidenceRequests(requestResponse.ok ? requestData.requests || [] : []); setEvidenceRequestText("");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to open claim"); }
    finally { setDetailLoading(false); }
  }

  useEffect(() => {
    const requestedClaimId = searchParams.get("claim");
    if (!requestedClaimId || loading || selected || detailLoading) return;
    const row = claims.find((item) => item.id === requestedClaimId);
    if (row) {
      void openClaim(row);
      // Consume the deep-link query so closing the modal does not reopen it,
      // and clicking the same notification later can open it again.
      router.replace(`${window.location.pathname}?tab=claims`, { scroll: false });
    } else if (claims.length > 0) {
      setError("That claim is not available in this workspace.");
    }
  // selected/detailLoading intentionally prevent reopening the same claim after a modal interaction.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, claims, selected, detailLoading, router]);

  async function assignReviewer(reviewerId: string) {
    if (!selected) return; setAssigning(true); setError("");
    try { const response = await fetch(`/api/claims/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignReviewerId: reviewerId || null }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to assign reviewer"); setSelected({ ...selected, reviewerId: data.reviewerId }); await loadClaims(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to assign reviewer"); }
    finally { setAssigning(false); }
  }

  async function requestEvidence() {
    if (!selected || evidenceRequestText.trim().length < 5) return; setRequestingEvidence(true); setError("");
    try { const response = await fetch(`/api/claims/${selected.id}/evidence-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: evidenceRequestText }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to request evidence"); setEvidenceRequestText(""); const refreshed = await fetch(`/api/claims/${selected.id}/evidence-requests`, { cache: "no-store" }); const refreshedData = await refreshed.json(); setEvidenceRequests(refreshedData.requests || []); if (data.error) setError(data.error); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to request evidence"); }
    finally { setRequestingEvidence(false); }
  }

  async function decide(decision: "Approved" | "Rejected" | "Needs Review") {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/claims/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save decision");
      setSelected(null);
      setEvidence([]);
      setNotes("");
      await loadClaims();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save decision"); }
    finally { setSaving(false); }
  }

  return <>
    <section className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-[26px] font-bold text-[#0F172A]">Claims</h1><p className="mt-1 text-sm text-[#64748B]">All workspace reviewers can open and work on submitted claims. Admin assignment is optional.</p></div><div className="flex flex-wrap items-center gap-2 sm:gap-3"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{claims.length} shown</span><button type="button" onClick={() => void loadClaims()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><LuRefreshCw size={16} className={loading ? "animate-spin" : ""}/>{loading ? "Refreshing…" : "Refresh"}</button></div></div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 lg:w-[330px]"><LuSearch size={16} className="shrink-0 text-slate-400"/><input aria-label="Search claims" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search claim, customer, vehicle…" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></div><div className="flex flex-wrap gap-2">{statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${status === item ? "border-[#1F66FF] bg-[#1F66FF] text-white" : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50"}`}>{item}</button>)}</div></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm"><thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-[#64748B]"><tr>{["Claim ID", "Customer", "Vehicle", "Status", "Reviewer", "AI triage score", "Created"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#E2E8F0]">{loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading claims…</td></tr> : claims.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No claims yet. New customer submissions will appear here.</td></tr> : claims.slice(0, compact ? 8 : 100).map((item) => <tr key={item.id} className="cursor-pointer transition hover:bg-blue-50/40" onClick={() => void openClaim(item)}><td className="whitespace-nowrap px-4 py-4 font-semibold text-[#1F66FF]">{item.claimNumber}</td><td className="px-4 py-4"><p className="font-medium text-slate-900">{item.customerName}</p><p className="text-xs text-slate-500">{item.customerEmail}</p></td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.vehicleMake} {item.vehicleModel} {item.vehicleYear}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[item.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{item.status}</span></td><td className="px-4 py-4 text-slate-500">{item.reviewerName || item.reviewerEmail || (item.reviewerId ? "Reviewer" : "Unassigned")}</td><td className="px-4 py-4 font-semibold text-emerald-700">{item.aiConfidence == null ? "—" : <span title="Model-estimated triage confidence; not a calibrated probability or final decision.">{item.aiConfidence}%</span>}</td><td className="whitespace-nowrap px-4 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>
      </div>
    </section>

    {(selected || detailLoading) && <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/40 p-3 pt-6 sm:p-8" role="dialog" aria-modal="true" aria-label="Claim review"><div className="my-auto w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Claim review</p><h2 className="mt-1 text-xl font-bold">{selected?.claimNumber || "Loading claim…"}</h2></div><button aria-label="Close claim" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><LuX size={20}/></button></div>
      {detailLoading ? <div className="p-10 text-center text-slate-500">Loading claim evidence…</div> : selected && <div className="grid gap-0 md:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5 border-b border-slate-100 p-5 sm:p-7 md:border-b-0 md:border-r"><div><h3 className="font-semibold">Customer & incident</h3><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Customer</p><p className="mt-1 font-medium">{selected.customerName}</p></div><div><p className="text-xs text-slate-500">Email</p><p className="mt-1 break-words font-medium">{selected.customerEmail}</p></div><div><p className="text-xs text-slate-500">Vehicle</p><p className="mt-1 font-medium">{selected.vehicleMake} {selected.vehicleModel} ({selected.vehicleYear})</p></div><div><p className="text-xs text-slate-500">Registration</p><p className="mt-1 font-medium">{selected.registrationNumber}</p></div><div><p className="text-xs text-slate-500">Accident date</p><p className="mt-1 font-medium">{selected.accidentDate}</p></div><div><p className="text-xs text-slate-500">Status</p><p className="mt-1"><span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[selected.status] || ""}`}>{selected.status}</span></p></div></div><p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{selected.incidentDescription}</p></div>
          <div><h3 className="font-semibold">Evidence ({evidence.length})</h3>{evidence.length === 0 ? <p className="mt-2 text-sm text-slate-500">No evidence uploaded.</p> : <div className="mt-3 grid grid-cols-2 gap-3">{evidence.map((file) => <a key={file.id} href={file.dataUrl} download={file.fileName} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-slate-200 hover:border-blue-300">{file.mimeType.startsWith("image/") ? <img src={file.dataUrl} alt={file.fileName} className="h-28 w-full object-cover"/> : <div className="flex h-28 flex-col items-center justify-center bg-slate-50 text-slate-500"><LuFileText size={28}/><span className="mt-2 text-xs">PDF document</span></div>}<p className="truncate px-2 py-2 text-xs font-medium">{file.fileName}</p></a>)}</div>}</div>
        </div>
        <div className="space-y-5 p-5 sm:p-7"><div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-center gap-2"><LuShieldCheck className="text-[#1F66FF]"/><h3 className="font-semibold">AI triage</h3></div><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-500">Confidence</p><p className="mt-1 text-3xl font-bold">{selected.aiConfidence == null ? "—" : `${selected.aiConfidence}%`}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700">{selected.aiRecommendation || "pending"}</span></div><p className="mt-3 text-sm leading-6 text-slate-700">{selected.aiSummary || "AI analysis has not run yet."}</p></div>
          <div><h3 className="flex items-center gap-2 font-semibold"><LuTriangleAlert className="text-amber-500"/>Risk flags</h3>{selected.riskFlags?.length ? <ul className="mt-3 space-y-2">{selected.riskFlags.map((flag, i) => <li key={`${flag}-${i}`} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">{flag}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No risk flags reported.</p>}</div>
          <div className="rounded-xl border border-slate-200 p-4"><label className="mb-2 block text-sm font-semibold" htmlFor="claim-assignee">Assigned reviewer</label>{canAssign ? <select id="claim-assignee" value={selected.reviewerId || ""} disabled={assigning} onChange={(e) => void assignReviewer(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Unassigned</option>{reviewers.map((reviewer) => <option key={reviewer.userId} value={reviewer.userId}>{reviewer.name || reviewer.email} · {reviewer.email}</option>)}</select> : <p className="text-sm text-slate-700">{reviewers.find((reviewer) => reviewer.userId === selected.reviewerId)?.name || reviewers.find((reviewer) => reviewer.userId === selected.reviewerId)?.email || (selected.reviewerId ? "Assigned reviewer" : "Unassigned")}</p>}<p className="mt-2 text-xs text-slate-500">Assignment is optional. All workspace reviewers can work on this claim.</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold">Request additional evidence</h3><p className="mt-1 text-xs leading-5 text-slate-500">Send the customer a secure, time-limited upload link by email. The link expires after 7 days.</p><textarea value={evidenceRequestText} onChange={(e) => setEvidenceRequestText(e.target.value)} rows={3} maxLength={1500} placeholder="e.g. Please upload a repair estimate and a clear photo of the damaged bumper." className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"/><button type="button" disabled={requestingEvidence || evidenceRequestText.trim().length < 5} onClick={() => void requestEvidence()} className="mt-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 disabled:opacity-50">{requestingEvidence ? "Sending request…" : "Email secure upload link"}</button>{evidenceRequests.length > 0 && <div className="mt-4 space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Previous requests</p>{evidenceRequests.map((request) => <div key={request.id} className="rounded-lg bg-slate-50 p-3"><p className="text-sm">{request.description}</p><p className="mt-1 text-xs text-slate-500">{request.fulfilledAt ? "Evidence received" : `Awaiting upload · expires ${new Date(request.expiresAt).toLocaleDateString()}`}</p></div>)}</div>}</div>
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="review-notes">Reviewer notes</label><textarea id="review-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={3000} placeholder="Explain your decision or request missing evidence…" className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"/></div>
          <p className="text-xs leading-5 text-slate-500">AI output is advisory and does not verify policy coverage or establish fraud. Confirm evidence and policy terms before deciding.</p>
          <div className="grid grid-cols-2 gap-2"><button disabled={saving} onClick={() => void decide("Approved")} className="rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? "Saving…" : "Approve claim"}</button><button disabled={saving} onClick={() => void decide("Rejected")} className="rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">Reject claim</button><button disabled={saving} onClick={() => void decide("Needs Review")} className="col-span-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Keep in review</button></div>
        </div>
      </div>}
    </div></div>}
  </>;
}

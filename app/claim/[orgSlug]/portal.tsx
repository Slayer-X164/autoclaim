"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const steps = ["Claim Details", "Vehicle Evidence", "Documents", "Review", "Submitted"];
type SubmittedClaim = { id: string; claimNumber: string; status: string; aiConfidence: number | null; aiRecommendation: string | null; createdAt?: string | Date; updatedAt?: string | Date; evidenceRequests?: Array<{ id: string; description: string; expiresAt: string | Date; fulfilledAt: string | Date | null; createdAt: string | Date }> };

export default function ClaimSubmissionPortal({ orgSlug, invitationToken }: { orgSlug: string; invitationToken?: string }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedClaim | null>(null);
  const [organizationName, setOrganizationName] = useState("Insurance provider");
  const [effectiveOrgSlug, setEffectiveOrgSlug] = useState(orgSlug);
  const [invitationError, setInvitationError] = useState("");
  const [values, setValues] = useState({ customerName: "", customerEmail: "", vehicleMake: "", vehicleModel: "", vehicleYear: String(new Date().getFullYear() - 2), registrationNumber: "", accidentDate: "", incidentDescription: "" });
  useEffect(() => {
    if (invitationToken) {
      fetch(`/api/public/claim-invitations/${encodeURIComponent(invitationToken)}`).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "This invitation is not valid.");
        setOrganizationName(data.invitation.organizationName);
        setEffectiveOrgSlug(data.invitation.organizationSlug);
        setValues((current) => ({ ...current, customerName: data.invitation.customerName, customerEmail: data.invitation.customerEmail }));
        if (data.submitted && data.claim) {
          setSubmitted(data.claim);
          setStep(4);
        }
      }).catch((error) => setInvitationError(error instanceof Error ? error.message : "This invitation is not valid."));
      return;
    }
    fetch(`/api/public/workspaces/${encodeURIComponent(orgSlug)}`).then((response) => response.ok ? response.json() : null).then((data) => { if (data?.workspace?.name) setOrganizationName(data.workspace.name); }).catch(() => undefined);
  }, [orgSlug, invitationToken]);

  // Keep the customer's submitted screen current, including after a page refresh.
  useEffect(() => {
    if (!invitationToken || step !== 4 || !submitted) return;
    let cancelled = false;
    const refreshStatus = async () => {
      try {
        const response = await fetch(`/api/public/claim-invitations/${encodeURIComponent(invitationToken)}`, { cache: "no-store" });
        const data = await response.json();
        if (!cancelled && response.ok && data.submitted && data.claim) setSubmitted(data.claim);
      } catch { /* Keep the last known status visible if the network is temporarily unavailable. */ }
    };
    const interval = window.setInterval(refreshStatus, 15000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [invitationToken, step, submitted?.id]);
  const [files, setFiles] = useState<File[]>([]);
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const photos = useMemo(() => files.filter((file) => file.type.startsWith("image/")), [files]);
  const documents = useMemo(() => files.filter((file) => file.type === "application/pdf"), [files]);
  const inputClass = "w-full rounded-lg border border-[#DCE3EC] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#1F66FF] focus:ring-2 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#334155]";

  function handleFiles(list: FileList | null) {
    if (!list) return;
    setError("");
    const incoming = Array.from(list);
    const merged = [...files, ...incoming];
    if (merged.length > 5) { setError("Upload up to 5 files total."); return; }
    if (merged.some((file) => file.size > 2 * 1024 * 1024)) { setError("Each file must be 2 MB or smaller."); return; }
    if (merged.some((file) => !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type))) { setError("Use JPG, PNG, WEBP, or PDF files only."); return; }
    setFiles(merged);
  }

  async function submitClaim(event: FormEvent) {
    event.preventDefault();
    if (step < 3) { setStep((current) => current + 1); return; }
    setBusy(true); setError("");
    try {
      const form = new FormData();
      form.set("orgSlug", effectiveOrgSlug);
      if (invitationToken) form.set("invitationToken", invitationToken);
      Object.entries(values).forEach(([key, value]) => form.set(key, value));
      files.forEach((file) => form.append("evidence", file));
      const response = await fetch("/api/claims", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't submit your claim.");
      setSubmitted(data.claim);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  const requiredDetailsValid = values.customerName.trim() && values.customerEmail.includes("@") && values.vehicleMake.trim() && values.vehicleModel.trim() && values.registrationNumber.trim() && values.accidentDate && values.incidentDescription.trim().length >= 15;

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 font-instrument text-[#0F172A] sm:py-12">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-7 flex items-center justify-center gap-2">
          <Image src="/images/logo.png" width={36} height={36} alt="AutoClaimAI" />
          <span className="text-lg font-semibold">AutoClaimAI</span>
          <span className="mx-1 text-slate-300">/</span>
          <span className="text-sm text-slate-500">Insurance claim portal</span>
        </header>
        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E8EDF4] px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">{organizationName}</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Submit a motor claim</h1></div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1F66FF]">Secure form</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {steps.map((name, index) => <div key={name} className="min-w-0">
                <div className={`mb-2 h-1.5 rounded-full ${index <= step ? "bg-[#1F66FF]" : "bg-[#E2E8F0]"}`} />
                <p className={`truncate text-[10px] sm:text-xs ${index === step ? "font-semibold text-[#1F66FF]" : index < step ? "text-[#334155]" : "text-[#94A3B8]"}`}>{name}</p>
              </div>)}
            </div>
          </div>
          {invitationError ? <div role="alert" className="mx-5 mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:mx-8">{invitationError}</div> : null}
          <form onSubmit={submitClaim} className="px-5 py-6 sm:px-8 sm:py-8">
            {step === 0 && !invitationError && <div className="space-y-6">
              <div><h2 className="text-lg font-semibold">Claim and vehicle details</h2><p className="mt-1 text-sm text-slate-500">Tell us who you are and what happened.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Full name *</label><input className={inputClass} autoComplete="name" value={values.customerName} onChange={(e) => update("customerName", e.target.value)} required placeholder="e.g. Rahul Malhotra" /></div>
                <div><label className={labelClass}>Email address *</label><input className={inputClass} type="email" autoComplete="email" value={values.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} required placeholder="you@example.com" /></div>
                <div><label className={labelClass}>Vehicle make *</label><input className={inputClass} value={values.vehicleMake} onChange={(e) => update("vehicleMake", e.target.value)} required placeholder="Hyundai" /></div>
                <div><label className={labelClass}>Vehicle model *</label><input className={inputClass} value={values.vehicleModel} onChange={(e) => update("vehicleModel", e.target.value)} required placeholder="Creta" /></div>
                <div><label className={labelClass}>Model year *</label><input className={inputClass} type="number" min="1950" max={new Date().getFullYear() + 1} value={values.vehicleYear} onChange={(e) => update("vehicleYear", e.target.value)} required /></div>
                <div><label className={labelClass}>Registration number *</label><input className={inputClass} value={values.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value.toUpperCase())} required placeholder="MH01AB1234" /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Date of accident *</label><input className={inputClass} type="date" max={new Date().toISOString().slice(0, 10)} value={values.accidentDate} onChange={(e) => update("accidentDate", e.target.value)} required /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Describe the incident *</label><textarea className={`${inputClass} min-h-28 resize-y`} value={values.incidentDescription} onChange={(e) => update("incidentDescription", e.target.value)} minLength={15} required placeholder="Describe how the damage happened, where it occurred, and any other relevant details." /></div>
              </div>
            </div>}
            {step === 1 && <div className="space-y-5">
              <div><h2 className="text-lg font-semibold">Vehicle evidence</h2><p className="mt-1 text-sm text-slate-500">Upload clear photos showing the damaged area from more than one angle.</p></div>
              <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 text-center transition hover:border-[#1F66FF] hover:bg-blue-50/40"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl text-[#1F66FF]">↑</span><span className="font-semibold">Choose evidence files</span><span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP or PDF · max 2 MB per file · up to 5 files</span><input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFiles(e.target.files)} /></label>
              {files.length > 0 && <div className="space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><div className="min-w-0"><p className="truncate font-medium">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · {file.type.startsWith("image/") ? "Vehicle photo" : "Document"}</p></div><button type="button" className="ml-3 text-sm text-red-600" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}
              <p className="text-xs text-slate-500">{photos.length} photo(s) and {documents.length} document(s) selected. Claims can be submitted without attachments, but a reviewer may request evidence.</p>
            </div>}
            {step === 2 && <div className="space-y-5"><div><h2 className="text-lg font-semibold">Supporting documents</h2><p className="mt-1 text-sm text-slate-500">You can add a registration certificate, estimate, or other relevant PDF alongside your photos.</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="font-medium">Selected files</p>{files.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex justify-between gap-3"><span className="truncate">{file.name}</span><span className="shrink-0">{file.type === "application/pdf" ? "Document" : "Photo"}</span></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No files attached yet. You can go back to add photos or documents.</p>}</div><label className="flex cursor-pointer items-center justify-center rounded-lg border border-[#DCE3EC] px-4 py-3 text-sm font-medium text-[#1F66FF] hover:bg-blue-50">+ Add more files<input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFiles(e.target.files)} /></label></div>}
            {step === 3 && <div className="space-y-5"><div><h2 className="text-lg font-semibold">Review your claim</h2><p className="mt-1 text-sm text-slate-500">Check the details below before sending your claim to the review team.</p></div><div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">{[["Customer", values.customerName], ["Email", values.customerEmail], ["Vehicle", `${values.vehicleMake} ${values.vehicleModel} (${values.vehicleYear})`], ["Registration", values.registrationNumber], ["Accident date", values.accidentDate], ["Evidence", `${files.length} file(s)`], ["Incident", values.incidentDescription]].map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="break-words font-medium">{value}</span></div>)}</div><p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">AI analysis is a triage aid only. A reviewer makes the final claim decision. Submitting this form does not guarantee coverage or payment.</p></div>}
            {step === 4 && submitted && <div className="py-6 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div><h2 className="mt-4 text-2xl font-bold">Claim submitted successfully</h2><p className="mt-2 text-sm text-slate-500">Your claim is saved and waiting for a reviewer.</p><div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 p-5 text-left"><p className="text-xs uppercase tracking-wider text-slate-500">Claim reference</p><p className="mt-1 text-xl font-bold text-[#1F66FF]">{submitted.claimNumber}</p><div className="mt-4 flex items-center justify-between gap-3 text-sm"><span className="text-slate-500">Current status</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submitted.status === "Approved" || submitted.status === "Auto Approved" ? "bg-emerald-50 text-emerald-700" : submitted.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{submitted.status}</span></div>{submitted.evidenceRequests && submitted.evidenceRequests.length > 0 && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-semibold text-amber-900">Additional evidence requests</p><div className="mt-2 space-y-3">{submitted.evidenceRequests.map((request) => <div key={request.id} className="border-t border-amber-200 pt-2"><p className="text-sm text-amber-950">{request.description}</p><p className="mt-1 text-xs text-amber-800">{request.fulfilledAt ? "Evidence received" : `Awaiting upload · link expires ${new Date(request.expiresAt).toLocaleDateString()}`}</p></div>)}</div><p className="mt-3 text-xs text-amber-900">Use the secure upload link sent to your email to provide the requested files.</p></div>}<div className="mt-5 space-y-3">{[{ label: "Claim submitted", done: true }, { label: "Initial assessment", done: ["Needs Review", "Approved", "Rejected", "Auto Approved"].includes(submitted.status) }, { label: submitted.status === "Approved" || submitted.status === "Auto Approved" ? "Claim approved" : submitted.status === "Rejected" ? "Claim decision completed" : "Reviewer assessment", done: ["Approved", "Rejected", "Auto Approved"].includes(submitted.status) }].map((item, index) => <div key={item.label} className="flex items-center gap-3 text-sm"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{item.done ? "✓" : index + 1}</span><span className={item.done ? "font-medium text-slate-800" : "text-slate-500"}>{item.label}</span></div>)}</div>{submitted.aiConfidence !== null && <div className="mt-4 flex justify-between text-sm"><span className="text-slate-500">AI triage confidence</span><span className="font-semibold">{submitted.aiConfidence}%</span></div>}<p className="mt-4 text-xs leading-5 text-slate-500">This page refreshes the claim status automatically. You can safely bookmark this private link to check progress later.</p></div><p className="mt-5 text-xs text-slate-500">Keep your reference number for follow-up. We have not made a final coverage decision.</p><Link href="/" className="mt-6 inline-flex rounded-lg bg-[#1F66FF] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Back to AutoClaimAI</Link></div>}
            {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
            {step < 4 && !invitationError && <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" disabled={step === 0 || busy} onClick={() => setStep((current) => Math.max(0, current - 1))} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:invisible">Back</button><button type="submit" disabled={busy || (step === 0 && !requiredDetailsValid)} className="rounded-lg bg-[#1F66FF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Submitting claim…" : step === 3 ? "Submit claim" : "Continue"}</button></div>}
          </form>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">Your information is used to assess this insurance claim. Only upload documents you are authorized to share.</p>
      </div>
    </main>
  );
}

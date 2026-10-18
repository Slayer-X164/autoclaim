"use client";
import { useCallback, useEffect, useState } from "react";

type Invitation = { id: string; customerName: string; customerEmail: string; expiresAt: string; usedAt: string | null; revokedAt: string | null; claimId: string | null; createdAt: string };
export default function CustomerInvitationsCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const load = useCallback(async () => { const response = await fetch("/api/claim-invitations", { cache: "no-store" }); if (response.ok) { const data = await response.json(); setInvitations(data.invitations || []); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function createInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage(""); setLink("");
    try {
      const response = await fetch("/api/claim-invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: name, customerEmail: email, expiresInHours: 72 }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not create invitation.");
      setLink(data.inviteLink); setEmailSent(data.emailSent); setMessage(data.emailSent ? "Invitation created and emailed to the customer." : "Invitation created. Copy the secure link below and send it to the customer.");
      setName(""); setEmail(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }
  async function copyLink() { try { await navigator.clipboard.writeText(link); setMessage("Link copied. Send it only to the intended customer."); } catch { setMessage("Copy the link from the field below."); } }
  return <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
    <div className="mb-4"><h2 className="text-base font-semibold text-[#0F172A]">Customer claim invitations</h2><p className="mt-1 text-sm text-[#64748B]">Create a single-use link for a customer. Links expire after 72 hours.</p></div>
    <form onSubmit={createInvitation} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input className="min-w-0 rounded-lg border border-[#DCE3EC] px-3 py-2.5 text-sm outline-none focus:border-[#1F66FF]" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer full name" required maxLength={160}/>
      <input className="min-w-0 rounded-lg border border-[#DCE3EC] px-3 py-2.5 text-sm outline-none focus:border-[#1F66FF]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" type="email" required/>
      <button disabled={busy} className="rounded-lg bg-[#1F66FF] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create link"}</button>
    </form>
    {message && <p role="status" className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}{emailSent ? " Email sent." : ""}</p>}
    {link && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={link} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" aria-label="Generated customer claim link"/><button onClick={copyLink} type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">Copy link</button></div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="mb-2 text-sm font-semibold">Recent invitations</h3>{invitations.length === 0 ? <p className="text-sm text-slate-500">No invitations created yet.</p> : <div className="space-y-2">{invitations.slice(0, 5).map((item) => { const status = item.usedAt ? "Used" : item.revokedAt ? "Revoked" : new Date(item.expiresAt) < new Date() ? "Expired" : "Pending"; return <div key={item.id} className="flex flex-col justify-between gap-1 rounded-lg border border-slate-100 px-3 py-2 sm:flex-row sm:items-center"><div><p className="text-sm font-medium text-slate-800">{item.customerName}</p><p className="text-xs text-slate-500">{item.customerEmail}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${status === "Pending" ? "bg-amber-50 text-amber-700" : status === "Used" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{status}</span></div>; })}</div>}</div>
    <p className="mt-4 text-xs leading-5 text-slate-400">Treat invitation URLs like passwords. The database stores only a hash of each token. Email delivery requires RESEND_API_KEY and a verified sender domain.</p>
  </section>;
}

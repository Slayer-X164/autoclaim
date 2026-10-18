"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuSearch, LuTrash2 } from "react-icons/lu";
import InviteModal from "@/component/dashboard/admin/InviteModal";

type Member = { id: string; name: string; email: string; role: string; pending: number; createdAt?: string };
export default function AdminReviewersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/workspace/members", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load workspace members."); setMembers(data.members || []); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load reviewers."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function removeReviewer(member: Member) {
    const confirmed = window.confirm(`Permanently remove ${member.name} (${member.email}) from this organization? Their account will remain, but they will lose workspace access. Claims assigned to them will become unassigned.`);
    if (!confirmed) return;
    setDeletingId(member.id); setError("");
    try {
      const response = await fetch(`/api/workspace/members/${member.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not remove reviewer.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not remove reviewer."); }
    finally { setDeletingId(null); }
  }
  const reviewers = useMemo(() => members.filter(m => m.role === "reviewer" && `${m.name} ${m.email}`.toLowerCase().includes(query.toLowerCase())), [members, query]);
  return <section className="flex flex-col gap-5 p-5 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-[28px] font-bold text-[#0F172A]">Reviewers</h1><p className="mt-1 text-sm text-slate-500">Manage your organization&apos;s claim review team.</p></div><button onClick={() => setInviteOpen(true)} className="rounded-lg bg-[#1F66FF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">+ Invite reviewer</button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Reviewers" value={members.filter(m => m.role === "reviewer").length}/><Metric label="Workspace members" value={members.length}/><Metric label="Pending claims assigned" value={members.reduce((sum,m)=>sum+(m.role === "reviewer" ? m.pending : 0),0)}/></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 sm:w-80"><LuSearch className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reviewer name or email" className="min-w-0 flex-1 text-sm outline-none"/></div></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-800">Reviewer directory</div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Reviewer</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Pending claims</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading reviewers…</td></tr> : reviewers.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">{query ? "No reviewers match your search." : "No reviewers yet. Invite a teammate to get started."}</td></tr> : reviewers.map(m => <tr key={m.id}><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">{m.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</div><span className="font-medium text-slate-900">{m.name}</span></div></td><td className="px-4 py-4 text-slate-600">{m.email}</td><td className="px-4 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{m.pending}</span></td><td className="px-4 py-4 capitalize text-slate-600">{m.role}</td><td className="px-4 py-4"><button disabled={deletingId===m.id} onClick={() => void removeReviewer(m)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><LuTrash2 size={14}/>{deletingId===m.id ? "Removing…" : "Remove"}</button></td></tr>)}</tbody></table></div></div>
    <InviteModal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); void load(); }}/>
  </section>;
}
function Metric({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>; }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClaimRow = {
  id: string;
  claimNumber: string;
  customerName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  status: string;
  aiRecommendation: string | null;
  reviewerId: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
};
const colors: Record<string, string> = {
  "Needs Review": "bg-amber-50 border-amber-200 text-amber-700",
  Processing: "bg-blue-50 border-blue-200 text-blue-700",
  Approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Rejected: "bg-red-50 border-red-200 text-red-700",
  "Auto Approved": "bg-violet-50 border-violet-200 text-violet-700",
};

export default function RecentClaimsTable() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  useEffect(() => {
    fetch("/api/claims", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setClaims((data.claims || []).slice(0, 5)))
      .catch((error) => console.error("Could not load recent claims", error));
  }, []);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0F172A]">Recent Claims</h2>
        <Link
          href="/dashboard/admin?tab=claims"
          className="text-xs font-semibold text-[#1F66FF] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase text-[#64748B]">
            <tr>
              {[
                "Claim",
                "Customer",
                "Vehicle",
                "Status",
                "AI rec.",
                "Assigned",
              ].map((heading) => (
                <th key={heading} className="px-3 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {claims.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-sm text-slate-500"
                >
                  No claims submitted yet.
                </td>
              </tr>
            ) : (
              claims.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#1F66FF]">
                    {item.claimNumber}
                  </td>
                  <td className="px-3 py-3 font-medium">{item.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                    {item.vehicleMake} {item.vehicleModel} {item.vehicleYear}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold ${colors[item.status] || ""}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 capitalize text-slate-600">
                    {item.aiRecommendation || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {item.reviewerName ||
                      item.reviewerEmail ||
                      (item.reviewerId ? "Reviewer" : "Unassigned")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

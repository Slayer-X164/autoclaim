"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { FileUp } from "lucide-react";
import { useParams } from "next/navigation";
type RequestInfo = {
  description: string;
  expiresAt: string;
  fulfilled: boolean;
  claimNumber: string;
  customerName: string;
  organizationName: string;
};
export default function EvidenceUploadPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [info, setInfo] = useState<RequestInfo | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    fetch(`/api/public/evidence-requests/${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Unable to open upload link");
        setInfo(d.request);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to open upload link"),
      );
  }, [token]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      files.forEach((f) => form.append("evidence", f));
      const r = await fetch(
        `/api/public/evidence-requests/${encodeURIComponent(token)}`,
        { method: "POST", body: form },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      setSuccess(true);
      if (info) setInfo({ ...info, fulfilled: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <Image
            src="/images/logo.png"
            width={34}
            height={34}
            alt="AutoClaimAI"
          />
          <div>
            <p className="font-semibold">AutoClaimAI</p>
            <p className="text-sm text-slate-500">Secure evidence upload</p>
          </div>
        </header>
        <div className="p-6 sm:p-8">
          {error && !info ? (
            <div
              role="alert"
              className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800"
            >
              {error}
            </div>
          ) : !info ? (
            <p className="text-sm text-slate-500">
              Loading secure upload request…
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {info.organizationName}
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                Additional evidence requested
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Claim reference: {info.claimNumber}
              </p>
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold">What your insurer needs</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {info.description}
                </p>
              </div>
              {info.fulfilled || success ? (
                <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                  Evidence received successfully. You can close this page.
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <label className="block text-sm font-medium">

                    <input
                      className="peer sr-only"
                      type="file"
                      multiple
                      required
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files || []))
                      }
                    />
                    <span className="mt-2 flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition-colors hover:border-blue-400 hover:bg-blue-50/50 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 sm:px-5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                        <FileUp size={21} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-800">
                          Select files
                        </span>
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Choose files from your device
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        Browse
                      </span>
                    </span>
                  </label>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, WebP, or PDF. Maximum 5 files, 2 MB each.
                  </p>

                  {files.length > 0 && (
                    <>
                    <span className="capitalize  text-sm font-semibold">selected files:</span>
                    <ul className="space-y-1 text-sm text-slate-600 mt-1">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`}>
                          {f.name} · {(f.size / 1024).toFixed(0)} KB
                        </li>
                      ))}
                    </ul>
                    </>

                  )}
                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  )}
                  <button
                    disabled={busy || !files.length}
                    className="w-full rounded-lg bg-[#1F66FF] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Uploading…" : "Submit evidence"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

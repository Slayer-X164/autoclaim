"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiMail,
  FiMenu,
  FiSearch,
  FiShield,
  FiUploadCloud,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

const features = [
  {
    number: "01",
    title: "Evidence intelligence",
    description:
      "Bring photos, documents, and claim details together. AI-assisted analysis helps reviewers identify evidence that needs a closer look.",
    kind: "evidence",
    tone: "from-violet-100/90 to-fuchsia-50",
  },
  {
    number: "02",
    title: "A clearer claims queue",
    description:
      "See what needs attention, what's in review, and what has been resolved from one organized workspace.",
    kind: "queue",
    tone: "from-blue-100/90 to-cyan-50",
  },
  {
    number: "03",
    title: "Smart notifications",
    description:
      "Keep track of new submissions, requested evidence, and claim status changes without losing the thread.",
    kind: "notifications",
    tone: "from-orange-100/80 to-rose-50",
  },
  {
    number: "04",
    title: "Team performance",
    description:
      "Give administrators and reviewers a shared view of assignments, activity, and the work waiting to be done.",
    kind: "team",
    tone: "from-emerald-100/80 to-sky-50",
  },
];

const testimonials = [
  {
    quote:
      "Having claim details and evidence together makes the review process feel much more organized. We can focus on the actual case instead of chasing information.",
    name: "Jordan T.",
    role: "Claims Reviewer",
    initials: "JT",
    color: "bg-orange-100 text-orange-700",
    mark: "text-orange-400",
  },
  {
    quote:
      "The workspace gives our team a clearer picture of what is waiting for review and where a claim stands. It makes collaboration much easier.",
    name: "Casey J.",
    role: "Team Lead",
    initials: "CJ",
    color: "bg-teal-100 text-teal-700",
    mark: "text-teal-400",
  },
  {
    quote:
      "AI-assisted findings are useful as a starting point. Reviewers still make the decision, but they have a more structured way to examine the evidence.",
    name: "Taylor B.",
    role: "Claims Manager",
    initials: "TB",
    color: "bg-violet-100 text-violet-700",
    mark: "text-violet-400",
  },
];

const steps = [
  {
    icon: FiUploadCloud,
    title: "Collect the evidence",
    description:
      "Customers submit claim details, photos, and supporting documents through a dedicated claim portal.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Let AI assist",
    description:
      "AI-assisted analysis organizes useful findings and highlights details that may need reviewer attention.",
  },
  {
    icon: FiShield,
    title: "Review with confidence",
    description:
      "Your team evaluates the evidence, records decisions, and tracks each claim through its workflow.",
  },
];

const faqs = [
  {
    question: "What is AutoClaimAI?",
    answer:
      "AutoClaimAI is an AI-assisted claims management platform that helps teams organize submissions, review supporting evidence, and track claims in one workspace.",
  },
  {
    question: "Does AI make the final claim decision?",
    answer:
      "No. AI-assisted analysis is intended to support the review process. Your team remains responsible for evaluating the evidence and making the final claim decision.",
  },
  {
    question: "Can customers submit evidence without a dashboard account?",
    answer:
      "Customers can use the claim portal provided through their invitation link to submit claim details and follow the claim's progress.",
  },
  {
    question: "Can multiple reviewers work in one organization?",
    answer:
      "Yes. Workspaces support administrator and reviewer roles so teams can manage claims and review activity centrally.",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
      {children}
    </p>
  );
}

function MiniClaimCard() {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-white/80 bg-white/95 p-4 text-left shadow-[0_20px_60px_-25px_rgba(15,23,42,.28)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FiFileText size={16} />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Claim documentation
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">Evidence bundle</p>
          </div>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <FiArrowUpRight size={14} />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900">08</p>
          <p className="text-[10px] text-slate-500">Files received</p>
        </div>
        <div className="flex -space-x-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-blue-700">
            <FiFileText size={12} />
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-violet-700">
            <FiFileText size={12} />
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-emerald-700">
            <FiCheck size={12} />
          </span>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
      </div>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/50" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[98%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20" />
      <div className="absolute left-1/2 top-[-12px] z-20 hidden -translate-x-1/2 sm:block">
        <MiniClaimCard />
      </div>
      <div className="absolute -left-2 top-[34%] z-20 hidden -translate-x-1/4 lg:block xl:-left-10">
        <div className="w-[250px] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_20px_60px_-25px_rgba(15,23,42,.28)] backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Evidence review</span>
            <FiArrowUpRight className="text-slate-400" />
          </div>
          <div className="mt-4 flex gap-1">
            <span className="h-1.5 w-[28%] rounded-full bg-orange-400" />
            <span className="h-1.5 w-[42%] rounded-full bg-amber-300" />
            <span className="h-1.5 flex-1 rounded-full bg-teal-400" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["05", "Missing"],
              ["12", "Received"],
              ["03", "Review"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-2">
                <p className="text-sm font-bold text-slate-800">{value}</p>
                <p className="mt-1 text-[9px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-500">
            Evidence status at a glance
          </p>
        </div>
      </div>
      <div className="absolute -right-2 top-[39%] z-20 hidden translate-x-1/4 lg:block xl:-right-10">
        <div className="w-[250px] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_20px_60px_-25px_rgba(15,23,42,.28)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">Review queue</p>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
              Needs review
            </span>
          </div>
          {[
            ["Vehicle damage", "CL-2048"],
            ["Device damage", "CL-2047"],
          ].map(([label, id], i) => (
            <div
              key={id}
              className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === 0 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}
              >
                <FiFileText size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-slate-800">
                  {label}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-400">{id}</p>
              </div>
              <FiArrowUpRight size={13} className="text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[760px] rounded-[24px] border border-white/70 bg-white/20 p-2 shadow-[0_40px_100px_-40px_rgba(0,25,100,.5)] backdrop-blur-sm sm:rounded-[30px] sm:p-4">
        <div className="overflow-hidden rounded-[17px] border border-white/80 bg-white shadow-2xl sm:rounded-[22px]">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3 sm:h-14 sm:px-5">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                width={26}
                height={26}
                alt="AutoClaimAI"
                className="h-6 w-6 object-contain"
              />
              <span className="text-xs font-bold text-slate-900 sm:text-sm">
                AutoClaimAI
              </span>
              <span className="hidden rounded-md bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700 sm:inline-flex">
                Workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-slate-400 sm:inline">
                Claims overview
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                SD
              </span>
            </div>
          </div>
          <div className="grid min-h-[270px] grid-cols-1 sm:min-h-[310px] sm:grid-cols-[130px_1fr] md:grid-cols-[160px_1fr]">
            <aside className="hidden border-r border-slate-100 bg-slate-50/80 p-3 sm:block">
              <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Workspace
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-2.5 py-2 text-[10px] font-semibold text-white">
                <FiActivity size={13} /> Overview
              </div>
              <div className="mt-1 flex items-center gap-2 px-2.5 py-2 text-[10px] text-slate-500">
                <FiFileText size={13} /> Claims
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] text-slate-500">
                <FiUsers size={13} /> Reviewers
              </div>
              <div className="mt-8 rounded-xl border border-blue-100 bg-white p-3">
                <HiOutlineSparkles className="text-blue-600" size={16} />
                <p className="mt-2 text-[10px] font-bold text-slate-800">
                  AI-assisted review
                </p>
                <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
                  Evidence insights in one place.
                </p>
              </div>
            </aside>
            <div className="min-w-0 p-3 sm:p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] text-slate-400 sm:text-[10px]">
                    Your workspace
                  </p>
                  <h3 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                    Claims overview
                  </h3>
                  <p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">
                    A clearer view of your claims workflow.
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] text-slate-600 sm:px-3 sm:text-[10px]">
                  <FiActivity className="text-blue-600" /> Live workspace
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["248", "Total claims", FiFileText],
                  ["32", "Needs review", FiClock],
                  ["186", "AI analyzed", HiOutlineSparkles],
                ].map(([value, label, Icon]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-slate-100 p-2.5 sm:p-3"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] text-slate-500 sm:text-[10px]">
                        {String(label)}
                      </span>
                      <Icon size={12} className="shrink-0 text-blue-600" />
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-900 sm:text-2xl">
                      {String(value)}
                    </p>
                    <p className="mt-1 hidden text-[9px] text-slate-400 sm:block">
                      Sample dashboard data
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-bold text-slate-800 sm:text-xs">
                    Recent claims
                  </p>
                  <span className="text-[9px] font-medium text-blue-600">
                    View queue <FiArrowUpRight className="inline" />
                  </span>
                </div>
                {[
                  [
                    "CL-2048",
                    "Vehicle damage",
                    "Needs review",
                    "bg-amber-50 text-amber-700",
                  ],
                  [
                    "CL-2047",
                    "Device damage",
                    "In review",
                    "bg-blue-50 text-blue-700",
                  ],
                ].map(([id, type, status, tone]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 border-b border-slate-50 px-3 py-2.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <FiFileText size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold text-slate-800 sm:text-[10px]">
                          {id}
                        </p>
                        <p className="truncate text-[9px] text-slate-500">
                          {type}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-medium sm:text-[9px] ${tone}`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[8px] text-slate-400">
                Illustrative preview · Not live claim data
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 left-[16%] z-20 hidden sm:block">
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiCheck size={18} />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Review-ready workspace
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Evidence and activity together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureVisual({ kind }: { kind: string }) {
  if (kind === "evidence") {
    return (
      <div className="relative flex h-full min-h-[180px] items-center justify-center overflow-hidden p-5">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:17px_17px]" />
        <div className="relative grid w-full max-w-[330px] grid-cols-3 gap-2">
          {["Photo evidence", "Policy PDF", "Repair note"].map((label, i) => (
            <div
              key={label}
              className={`rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm ${i === 1 ? "translate-y-5" : ""}`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${i === 0 ? "bg-blue-50 text-blue-600" : i === 1 ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                <FiFileText size={16} />
              </div>
              <p className="mt-3 text-[9px] font-semibold text-slate-700">
                {label}
              </p>
              <p className="mt-1 text-[8px] text-slate-400">
                {i === 0
                  ? "Image · JPG"
                  : i === 1
                    ? "Document · PDF"
                    : "Document · PDF"}
              </p>
            </div>
          ))}
        </div>

      </div>
    );
  }
  if (kind === "queue") {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center p-5">
        <div className="w-full max-w-[360px] rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">Claims status</p>
            <FiArrowUpRight size={14} className="text-slate-400" />
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white">
            <span className="w-[54%] bg-blue-500" />
            <span className="w-[28%] bg-amber-300" />
            <span className="flex-1 bg-emerald-400" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["134", "In progress"],
              ["32", "Needs review"],
              ["82", "Reviewed"],
            ].map(([n, label], i) => (
              <div key={label}>
                <p
                  className={`text-lg font-bold ${i === 1 ? "text-amber-600" : "text-slate-800"}`}
                >
                  {n}
                </p>
                <p className="text-[9px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (kind === "notifications") {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center p-5">
        <div className="w-full max-w-[340px] space-y-2">
          {[
            [
              "Evidence received",
              "A customer uploaded new files.",
              "bg-blue-50 text-blue-600",
              FiUploadCloud,
            ],
            [
              "Review needed",
              "A claim is waiting for attention.",
              "bg-amber-50 text-amber-600",
              FiClock,
            ],
            [
              "Claim updated",
              "The review status has changed.",
              "bg-emerald-50 text-emerald-600",
              FiCheck,
            ],
          ].map(([title, desc, tone, Icon]) => (
            <div
              key={String(title)}
              className="flex items-center gap-3 rounded-xl border border-white bg-white/90 p-3 shadow-sm"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${String(tone)}`}
              >
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-800">
                  {String(title)}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">{String(desc)}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center p-5">
      <div className="w-full max-w-[360px] rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">Team activity</p>
          <FiUsers size={15} className="text-blue-600" />
        </div>
        <div className="mt-4 space-y-3">
          {[
            ["AM", "Alex Morgan", "Reviewer", "bg-blue-100 text-blue-700"],
            ["SK", "Sam Kim", "Reviewer", "bg-violet-100 text-violet-700"],
            ["JD", "Jamie Davis", "Admin", "bg-emerald-100 text-emerald-700"],
          ].map(([initials, name, role, tone]) => (
            <div key={name} className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold ${tone}`}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-slate-800">
                  {name}
                </p>
                <p className="text-[9px] text-slate-500">{role}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-clip bg-white font-instrument text-slate-950 selection:bg-blue-200 selection:text-blue-950">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <nav className="mx-auto flex  max-w-[1200px] items-center justify-between rounded-2xl border border-blue-600/40 bg-white/90 px-4 py-3 shadow-[0_8px_35px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2"
            aria-label="AutoClaimAI home"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo.png"
              width={40}
              height={40}
              alt="AutoClaimAI Logo"
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
              priority
            />
            <span className="text-base font-bold tracking-tight sm:text-xl">
              AutoClaim<span className="text-blue-600">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              About
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              FAQ
            </a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Get started <FiArrowUpRight size={15} />
            </Link>
          </div>
          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </nav>
        {menuOpen && (
          <div
            id="mobile-navigation"
            className="mx-auto mt-2 max-w-[1200px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl md:hidden"
          >
            {[
              ["About", "#about"],
              ["Features", "#features"],
              ["How it works", "#workflow"],
              ["Testimonials", "#testimonials"],
              ["FAQ", "#faq"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-semibold"
              >
                Log in
              </Link>
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero: atmospheric blue background and floating product UI */}
      <section className="relative isolate  overflow-hidden bg-gradient-to-b from-blue-700  to-white px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40 lg:pb-36 lg:pt-44">
        <div className="pointer-events-none  absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="mx-auto gap-4 flex max-w-[900px] flex-col items-center text-center">
          <h1 className="max-w-[850px] text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[72px]">
            Take the complexity out <br /> of claims review.
          </h1>
          <p className="mt-6 max-w-[650px] font-medium leading-7 text-white sm:text-lg ">
            Collect evidence, get AI-assisted insights, and keep your team
            aligned in one clear workspace. Less chasing information. More time
            for thoughtful review.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium cursor-pointer z-50 text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:text-base"
            >
              Create or Join Organisation <FiArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-[1100px] sm:mt-20">
          <HeroDashboard />
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[1120px] text-center">
          <SectionEyebrow>About AutoClaim AI</SectionEyebrow>
          <h2 className="mx-auto max-w-[760px] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Effortless claims operations,{" "}
            <span className="text-blue-600">
              from first upload to final review.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[700px] text-base leading-7 text-slate-600">
            Scattered files and repeated follow-ups make claims harder to
            manage. AutoClaimAI brings submissions, evidence, AI-assisted
            analysis, and reviewer activity into a single workspace designed to
            make the process easier to follow.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-[1080px] gap-10 md:grid-cols-3 md:gap-8">
          {[
            {
              icon: FiFileText,
              title: "One place for every claim",
              desc: "Keep submissions, supporting evidence, and status updates connected.",
            },
            {
              icon: HiOutlineSparkles,
              title: "AI that supports your team",
              desc: "Surface useful findings and give reviewers a more structured starting point.",
            },
            {
              icon: FiShield,
              title: "People remain in control",
              desc: "Keep the final assessment with your team, supported by clearer information.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-5 flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-1 rounded-full border border-dashed border-violet-300" />
                <div className="absolute inset-4 rounded-full border border-violet-200" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl  bg-linear-to-bl from-blue-600 to-blue-200  shadow-lg shadow-blue-600/20 text-white">
                  <item.icon size={25} />
                </div>
                <span className="absolute right-1 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-600 shadow-sm">
                  <FiCheck size={13} />
                </span>
              </div>
              <h3 className="text-base font-bold tracking-tight sm:text-lg ">
                {item.title}
              </h3>
              <p className="mt-2 max-w-[300px] text-sm leading-6 text-slate-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature bento grid inspired by the references */}
      <section
        id="features"
        className="scroll-mt-28 bg-white px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-[700px] text-center">
            <SectionEyebrow>Key features</SectionEyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="text-blue-600">review claims smarter.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[620px] text-base leading-7 text-slate-600">
              A thoughtfully connected toolkit for collecting evidence,
              organizing reviews, and helping your team stay on top of every
              claim.
            </p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-16">
            {features.map((feature) => (
              <article
                key={feature.number}
                className={`group overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br ${feature.tone} transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60`}
              >
                <FeatureVisual kind={feature.kind} />
                <div className="px-6 pb-7 pt-2 sm:px-8 sm:pb-8">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-blue-700">
                    {feature.number}
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      {feature.title}
                    </h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/60 text-slate-700 transition group-hover:bg-white">
                      <FiArrowUpRight size={15} />
                    </span>
                  </div>
                  <p className="mt-3 max-w-[450px] text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="scroll-mt-28 border-y border-slate-100 bg-[#F8FAFF] px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-[700px] text-center">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              A smoother path from{" "}
              <span className="text-blue-600">evidence to insight.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Make each step visible, from customer submission to reviewer
              assessment.
            </p>
          </div>
          <div className="relative mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-9 hidden border-t border-dashed border-blue-200 md:block" />
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                    <step.icon size={25} />
                  </div>
                  <span className="text-4xl font-semibold tracking-tight text-slate-100">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-7 text-lg font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials: clearly framed as illustrative placeholders */}
      <section
        id="testimonials"
        className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="text-center">
            <SectionEyebrow>Testimonials</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Designed around the people{" "}
              <span className="text-blue-600">behind every claim.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[640px] text-sm leading-6 text-slate-500 sm:text-base">
              Example testimonial cards to show the intended design. Replace
              these with approved feedback from real users before publishing.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 transition hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 sm:p-7"
              >
                <div
                  className={`mb-5 text-5xl leading-none ${testimonial.mark}`}
                  aria-hidden="true"
                >
                  “
                </div>
                <blockquote className="text-sm leading-6 text-slate-700">
                  {testimonial.quote}
                </blockquote>
                <div className="mt-7 flex items-center gap-3 border-t border-slate-200/70 pt-5">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${testimonial.color}`}
                  >
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                  <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400">
                    <FiArrowUpRight size={15} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="scroll-mt-28 border-t border-slate-100 bg-[#F8FAFF] px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto grid max-w-[1050px] gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <SectionEyebrow>FAQs</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions? <span className="text-blue-600">We have answers.</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Learn how AutoClaimAI fits into your claims review process.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Ask us something else <FiArrowRight size={15} />
            </a>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenFaq((current) =>
                          current === index ? null : index,
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
                    >
                      <span className="text-sm font-semibold leading-6 sm:text-base">
                        {faq.question}
                      </span>
                      <FiChevronDown
                        size={18}
                        className={`shrink-0 text-blue-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-4 pb-5 sm:px-5"
                    >
                      <p className="text-sm leading-6 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section
        id="contact"
        className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-[1000px] rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-10 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <FiHelpCircle size={25} />
          </div>
          <h2 className="mx-auto mt-6 max-w-[700px] text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Make your claims workflow feel connected.
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Bring evidence, reviewers, and claim progress together in one
            focused workspace.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Create your workspace <FiArrowRight size={16} />
            </Link>
            <a
              href="mailto:contact@autoclaimai.com"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <FiMail size={16} /> Contact us
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Replace the sample email address with your actual support contact.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              width={32}
              height={32}
              alt="AutoClaimAI Logo"
              className="h-7 w-7 object-contain"
            />
            <span className="text-base font-bold tracking-tight">
              AutoClaim<span className="text-blue-600">AI</span>
            </span>
          </Link>
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            AI-assisted claims review, with people in control.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500">
            <a href="#about" className="transition hover:text-blue-600">
              About
            </a>
            <a href="#features" className="transition hover:text-blue-600">
              Features
            </a>
            <a href="#testimonials" className="transition hover:text-blue-600">
              Testimonials
            </a>
            <a href="#contact" className="transition hover:text-blue-600">
              Contact
            </a>
            <a
              href="mailto:contact@autoclaimai.com"
              aria-label="Email AutoClaimAI"
              className="transition hover:text-blue-600"
            >
              <FiMail size={16} />
            </a>
          </div>
        </div>
        <div className="mx-auto mt-7 max-w-[1200px] border-t border-slate-100 pt-5 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} AutoClaimAI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

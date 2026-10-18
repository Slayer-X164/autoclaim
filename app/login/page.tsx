"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import EmailOTPForm from "@/component/auth/EmailOTPForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#1F66FF] p-4 font-instrument sm:p-6 lg:p-8">
      <div className="flex w-full max-w-[1250px] flex-col overflow-hidden rounded-[24px] bg-white p-4 shadow-2xl sm:rounded-[30px] sm:p-5 md:min-h-[650px] md:flex-row md:p-[25px]">
        {/* Branding panel */}
        <section className="relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[20px] bg-[rgba(11,88,255,0.08)] p-6 sm:min-h-[220px] sm:p-8 md:min-h-0 md:w-1/2 md:rounded-[26px] md:p-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-blue-400/50 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/40 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/images/logo.png"
              width={43}
              height={43}
              alt="AutoClaimAI Logo"
              priority
              className="h-9 w-9 object-contain sm:h-11 sm:w-11"
            />
            <span className="text-xl font-semibold text-black sm:text-2xl md:text-[28px]">
              AutoClaimAI
            </span>
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-3 md:mb-10 md:mt-0">
            <span className="hidden text-xl font-medium text-black md:block">
              You can easily
            </span>
            <h1 className="max-w-[500px] text-2xl font-medium leading-tight text-black sm:text-3xl md:text-[44px]">
              Get your vehicle claim reviewed and decided in minutes.
            </h1>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-w-0 flex-1 items-center justify-center px-2 py-7 sm:px-6 sm:py-9 md:w-1/2 md:px-10 md:py-8 lg:px-16">
          <div className="w-full max-w-[440px]">
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-blue-600"
            >
              <LuArrowLeft className="h-4 w-4 text-neutral-400" />
              Home
            </Link>

            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl md:text-5xl">
              Complete Login
            </h2>

            <p className="mb-7 mt-2 text-sm leading-relaxed text-[#828282] sm:text-base">
              Access your claims, reviews, and workspace securely from one
              place.
            </p>

            <EmailOTPForm />
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authClient,
  signInWithGitHub,
  signInWithGoogle,
} from "@/app/lib/auth-client";
import Image from "next/image";
import {
  LuArrowLeft,
  LuLoaderCircle,
  LuMail,
} from "react-icons/lu";

type Props = {
  invitationId?: string;
  invitedEmail?: string;
};

export default function EmailOTPForm({
  invitationId,
  invitedEmail,
}: Props) {
  const router = useRouter();

  const [email, setEmail] = useState(invitedEmail || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  // Keep loading states independent.
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "github" | "google" | null
  >(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Preserve the original callback destinations.
  const callbackURL = invitationId
    ? `/auth/invitation-callback?invitationId=${encodeURIComponent(
        invitationId,
      )}`
    : "/auth/callback";

  const isBusy =
    otpLoading || verifyLoading || socialLoading !== null;

  async function requestOTP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isBusy) return;

    setError("");
    setMessage("");
    setOtpLoading(true);

    try {
      const result =
        await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "sign-in",
        });

      if (result.error) {
        throw new Error(
          result.error.message || "Could not send code.",
        );
      }

      setStep("otp");
      setMessage(
        `A 6-digit code has been sent to ${email.trim()}.`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not send code. Check email configuration.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOTP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isBusy) return;

    setError("");
    setVerifyLoading(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (result.error) {
        throw new Error(
          result.error.message ||
            "That code could not be verified.",
        );
      }

      if (invitationId) {
        const invitationResult =
          await authClient.organization.acceptInvitation({
            invitationId,
          });

        if (invitationResult.error) {
          throw new Error(
            invitationResult.error.message ||
              "Signed in, but invitation acceptance failed. Use the invited email address.",
          );
        }

        router.replace("/dashboard/reviewer");
      } else {
        router.replace(callbackURL);
      }

      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setVerifyLoading(false);
    }
  }

  async function social(provider: "github" | "google") {
    if (isBusy) return;

    setError("");
    setMessage("");
    setSocialLoading(provider);

    try {
      if (provider === "github") {
        await signInWithGitHub(callbackURL);
      } else {
        await signInWithGoogle(callbackURL);
      }

      // OAuth normally redirects the browser.
      // If the helper returns without redirecting, restore the UI.
      window.setTimeout(() => {
        setSocialLoading((current) =>
          current === provider ? null : current,
        );
      }, 3000);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Could not continue with ${provider}.`,
      );

      setSocialLoading(null);
    }
  }

  function changeEmail() {
    setStep("email");
    setOtp("");
    setError("");
    setMessage("");
  }

  return (
    <div className="w-full">
      {step === "email" ? (
        <form
          onSubmit={requestOTP}
          className="flex flex-col gap-5"
        >
          <label className="flex flex-col gap-2 text-sm text-neutral-500">
            Enter your email

            <span className="relative">
              <LuMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!invitedEmail}
                disabled={isBusy}
                placeholder="abc@gmail.com"
                className="w-full rounded-lg border border-[#D1D1D1] bg-[#F9F9F9] py-3 pl-11 pr-4 text-base text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 read-only:opacity-70 disabled:opacity-60"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isBusy || !email.trim()}
            className="flex h-[58px] items-center justify-center gap-2 rounded-lg bg-black text-white shadow-xl transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {otpLoading && (
              <LuLoaderCircle className="animate-spin" />
            )}
            {otpLoading ? "Sending code…" : "Get OTP"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={verifyOTP}
          className="flex flex-col gap-5"
        >
          <div className="text-sm text-neutral-500">
            Enter the 6-digit code sent to{" "}
            <strong className="text-neutral-800">
              {email}
            </strong>.
          </div>

          <input
            aria-label="One-time password"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            disabled={isBusy}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
            placeholder="000000"
            className="w-full rounded-lg border border-[#D1D1D1] bg-[#F9F9F9] px-4 py-4 text-center text-2xl tracking-[0.5em] text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={isBusy || otp.length !== 6}
            className="cursor-pointer flex h-[58px] items-center justify-center gap-2 rounded-lg bg-black text-white shadow-xl transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {verifyLoading && (
              <LuLoaderCircle className="animate-spin" />
            )}
            {verifyLoading
              ? "Verifying…"
              : "Verify & sign in"}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={changeEmail}
            className="cursor-pointer flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-60"
          >
            <LuArrowLeft />
            Change email / resend code
          </button>
        </form>
      )}



      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {step === "email" && (
        <>
          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-neutral-200" />
            <span className="text-sm font-medium text-neutral-400">
              try login with
            </span>
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => social("github")}
              aria-label="Continue with GitHub"
              className="cursor-pointer flex h-11 w-[118px] items-center justify-center rounded-lg border border-[#D0CECE] bg-[#EFEFEF] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {socialLoading === "github" ? (
                <LuLoaderCircle
                  className="animate-spin"
                  size={22}
                />
              ) : (
                <Image
                  src="/images/github.png"
                  width={30}
                  height={30}
                  alt="GitHub"
                />
              )}
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => social("google")}
              aria-label="Continue with Google"
              className="cursor-pointer flex h-11 w-[118px] items-center justify-center rounded-lg border border-[#D0CECE] bg-[#EFEFEF] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {socialLoading === "google" ? (
                <LuLoaderCircle
                  className="animate-spin"
                  size={22}
                />
              ) : (
                <Image
                  src="/images/google.png"
                  width={30}
                  height={30}
                  alt="Google"
                />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

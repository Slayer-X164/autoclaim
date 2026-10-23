import Image from "next/image";
import EmailOTPForm from "@/component/auth/EmailOTPForm";
export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  return (
    <main className="min-h-screen bg-[#1F66FF] flex items-center justify-center p-4 sm:p-8 font-instrument">
      <div className="flex w-full max-w-[1120px] flex-col gap-5 rounded-[30px] bg-white p-5 shadow-2xl md:flex-row md:p-7">
        <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(11,88,255,0.08)] p-7 md:min-h-[590px] md:w-[45%] md:p-10">
          <div className="absolute -left-8 -top-10 h-56 w-56 rounded-full bg-blue-400/50 blur-[90px]" />
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/images/logo.png"
              width={40}
              height={40}
              alt="AutoClaimAI Logo"
            />
            <span className="text-2xl font-semibold text-black">
              AutoClaimAI
            </span>
          </div>
          <div className="relative z-10 py-8">
            <p className="mb-3 text-lg font-medium text-black">
              You’ve been invited
            </p>
            <h1 className="text-3xl leading-tight text-black md:text-4xl">
              Join your claims review team.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Sign in with the email address that received this invitation to
              securely accept your reviewer access.
            </p>
          </div>
        </section>
        <section className="flex flex-1 items-center justify-center px-2 py-8 md:px-10">
          <div className="w-full max-w-[430px]">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Reviewer invitation
            </p>
            <h2 className="mb-2 text-3xl font-bold text-black md:text-4xl">
              Accept invitation
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Verify your email using a one-time code, or continue with GitHub
              or Google. Use the same email address the invitation was sent to.
            </p>
            <EmailOTPForm invitationId={invitationId} />
          </div>
        </section>
      </div>
    </main>
  );
}

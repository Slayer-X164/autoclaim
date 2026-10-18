import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/app/lib/db/db"
import { organization, emailOTP } from "better-auth/plugins";
import { ac, admin, reviewer } from "./auth-permissions";
import { sendReviewerInvitation } from "./email"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
  cookiePrefix: "autoclaim",
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        const { sendEmailOTP } = await import("./email");
        await sendEmailOTP({ email, otp, type });
      },
    }),
    organization({
      creatorRole: "admin",
      teams: {
        enabled: false,
      },

      accessControl: ac,

      roles: {
        admin,
        reviewer
      },

      async sendInvitationEmail(data) {
        const inviteLink =
          `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;

        await sendReviewerInvitation({
          email: data.email,
          inviterName: data.inviter.user.name,
          organizationName: data.organization.name,
          inviteLink,
        });
      },
    })
  ],

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

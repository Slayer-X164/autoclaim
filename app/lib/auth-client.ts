import { createAuthClient } from "better-auth/react";
import { organizationClient, emailOTPClient } from "better-auth/client/plugins";
import { AppError } from "./error-handler";
import { ac, admin, reviewer } from "./auth-permissions";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    organizationClient({
      ac,
      roles: {
        admin,
        reviewer,
      },
    })
  ],
});

export const signInWithGoogle = async (callbackURL = "/auth/callback") => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL
  })
  if (data?.error) throw new AppError(data.error.message || "Something went wrong", 401, "UNAUTHORIZED")
  return data
}
export async function signInWithGitHub(callbackURL = "/auth/callback") {
  const data = await authClient.signIn.social({ provider: "github", callbackURL });
  if (data?.error) throw new AppError(data.error.message || "Something went wrong", 401, "UNAUTHORIZED");
  return data;
}

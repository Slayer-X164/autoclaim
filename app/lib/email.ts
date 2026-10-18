import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReviewerInvitation({
  email,
  inviterName,
  organizationName,
  inviteLink,
}: {
  email: string;
  inviterName: string;
  organizationName: string;
  inviteLink: string;
}) {
  if (!resend) { console.warn("RESEND_API_KEY is not configured; reviewer invitation email skipped."); return; }
  const { data, error } = await resend.emails.send({
    from: "AutoClaim AI <noreply@siddx.in>",
    to: email,
    subject: `You've been invited to AutoClaim AI`,
    html: `
      <div>
        <h2>You've been invited to AutoClaim AI</h2>

        <p>
          ${inviterName} has invited you to join
          <strong>${organizationName}</strong>
          as a Reviewer.
        </p>

        <a href="${inviteLink}">
          Accept Invitation
        </a>

        <p>
          This invitation will expire in 48 hours.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error sending email:", error);
  } else {
    console.log("Resend success sending email:", data);
  }
}
export async function sendCustomerClaimInvitation({
  email, customerName, organizationName, inviteLink, expiresAt,
}: {
  email: string; customerName: string; organizationName: string; inviteLink: string; expiresAt: Date;
}) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const client = new Resend(process.env.RESEND_API_KEY);
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM || "AutoClaim AI <noreply@siddx.in>",
    to: email,
    subject: `Submit your insurance claim to ${organizationName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Submit your motor claim</h2><p>Hello ${escapeHtml(customerName)},</p><p>${escapeHtml(organizationName)} has invited you to submit your insurance claim securely through AutoClaimAI.</p><p><a href="${inviteLink}" style="display:inline-block;background:#1f66ff;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Open secure claim portal</a></p><p>This single-use link expires on ${expiresAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST. If you were not expecting this email, you can ignore it.</p><p style="font-size:12px;color:#64748b">Do not forward this link; it is specific to your invitation.</p></div>`,
  });
  if (error) throw new Error(error.message);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export async function sendClaimStatusUpdate({ email, customerName, organizationName, claimNumber, status }: {
  email: string; customerName: string; organizationName: string; claimNumber: string; status: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const client = new Resend(process.env.RESEND_API_KEY);
  const message = status === "Approved"
    ? "Your claim has been marked approved by the insurer. Please contact the insurer for any settlement or coverage details."
    : status === "Rejected"
      ? "The insurer has recorded a decision on your claim. Please contact the insurer directly for the decision details and any available review process."
      : "The insurer needs to review your claim further. Please contact the insurer if you have questions or need to provide additional information.";
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM || "AutoClaim AI <noreply@siddx.in>",
    to: email,
    subject: `Update for claim ${claimNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Claim status update</h2><p>Hello ${escapeHtml(customerName)},</p><p>There is an update on your claim <strong>${escapeHtml(claimNumber)}</strong> with ${escapeHtml(organizationName)}.</p><p><strong>Status: ${escapeHtml(status)}</strong></p><p>${message}</p><p style="font-size:12px;color:#64748b">This email is a status notification, not a guarantee of payment or coverage.</p></div>`,
  });
  if (error) console.error("Claim status email failed", error.message);
}


export async function sendEmailOTP({ email, otp, type }: { email: string; otp: string; type: string }) {
  if (!process.env.RESEND_API_KEY) throw new Error("Email login is unavailable because RESEND_API_KEY is not configured.");
  const client = new Resend(process.env.RESEND_API_KEY);
  const purpose = type === "sign-in" ? "sign in to AutoClaimAI" : "verify your email";
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM || "AutoClaim AI <noreply@siddx.in>",
    to: email,
    subject: "Your AutoClaimAI sign-in code",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Your sign-in code</h2><p>Use this code to ${purpose}:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f1f5f9;padding:18px;border-radius:10px;text-align:center">${escapeHtml(otp)}</p><p>This code expires in 5 minutes. If you did not request it, you can ignore this email.</p></div>`,
  });
  if (error) throw new Error(error.message);
}


export async function sendEvidenceRequestEmail({ email, customerName, organizationName, claimNumber, description, uploadLink, expiresAt }: { email: string; customerName: string; organizationName: string; claimNumber: string; description: string; uploadLink: string; expiresAt: Date }) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured; cannot send evidence request.");
  const client = new Resend(process.env.RESEND_API_KEY);
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM || "AutoClaim AI <noreply@siddx.in>",
    to: email,
    subject: `Additional evidence requested for ${claimNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Additional evidence requested</h2><p>Hello ${escapeHtml(customerName)},</p><p>${escapeHtml(organizationName)} needs additional information for claim <strong>${escapeHtml(claimNumber)}</strong>.</p><blockquote style="padding:12px;background:#f8fafc;border-left:3px solid #1f66ff">${escapeHtml(description)}</blockquote><p><a href="${uploadLink}" style="display:inline-block;background:#1f66ff;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Upload requested evidence</a></p><p>This secure link expires on ${expiresAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.</p><p style="font-size:12px;color:#64748b">Only upload documents you are authorized to share.</p></div>`,
  });
  if (error) throw new Error(error.message);
}

"use client";
import { authClient } from "@/app/lib/auth-client";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleInvitation = async () => {
    const validation = emailSchema.safeParse(memberEmail.trim());

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setError("");
    setIsSending(true);

    try {
      const { data: org } = await authClient.organization.getFullOrganization();
      if (!org) {
        setError("Organization not found");
        return;
      }

      const { data, error } = await authClient.organization.inviteMember({
        email: memberEmail,
        role: "reviewer",
        organizationId: org.id,
      });

      if (error) {
        console.error("Invitation error:", error);
        setError(error.message || "Failed to send invitation");
        return;
      }

      console.log("Invitation created:", data);
      setMemberEmail("");
      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong while sending the invitation.");
    } finally {
      setIsSending(false);
    }

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091839]/60 backdrop-blur-[2px]">
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-instrument font-bold text-[20px] text-[#0F172A]">
            Invite Reviewer
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-instrument font-semibold text-[14px] text-[#475569]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. name@abcinsurance.com"
              value={memberEmail}
              onChange={(e) => {
                setMemberEmail(e.target.value);
                if (error) setError("");
              }}
              className={`w-full px-3 py-2.5 bg-white border ${error ? "border-red-500" : "border-[#E2E8F0]"} rounded-lg font-instrument font-regular text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#1F66FF]`}
            />
            {error && (
              <span className="text-red-500 font-instrument text-[12px]">
                {error}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg font-instrument font-semibold text-[14px] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleInvitation}
            disabled={isSending}
            className="px-4 py-2 bg-[#1F66FF] text-white rounded-lg font-instrument font-semibold text-[14px] hover:bg-[#1554D6] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

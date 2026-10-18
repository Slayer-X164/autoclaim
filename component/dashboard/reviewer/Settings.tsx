"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { useUserStore, type User } from "@/app/store/userStore";
import { useOrgStore } from "@/app/store/org-store";
import { LuUser, LuBell, LuShield, LuLogOut } from "react-icons/lu";

export default function Settings() {
  const user = useUserStore((state) => state.user);
  const role = useUserStore((state) => state.role);
  const activeOrg = useOrgStore((state) => state.activeOrg);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [claimUpdates, setClaimUpdates] = useState(true);
  const [reviewAssignments, setReviewAssignments] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.image || "");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  useEffect(() => {
    setFullName(user?.name || "");
    setProfileImage(user?.image || "");
    try { const raw = localStorage.getItem("autoclaim-reviewer-preferences"); if (raw) { const prefs = JSON.parse(raw); setEmailNotifications(prefs.emailNotifications ?? true); setClaimUpdates(prefs.claimUpdates ?? true); setReviewAssignments(prefs.reviewAssignments ?? false); } } catch {}
  }, [user?.name, user?.image]);
  function savePreferences() { localStorage.setItem("autoclaim-reviewer-preferences", JSON.stringify({ emailNotifications, claimUpdates, reviewAssignments })); setSavedMessage("Notification preferences saved in this browser."); }

  const tabs = ["Profile", "Notifications", "Security"];
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="flex flex-col items-start gap-4 w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between h-[35px]">
        <h1 className="font-instrument font-bold text-[28px] text-[#0F172A]">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 cursor-pointer py-1 rounded-full font-instrument text-[12px] font-medium border ${
              activeTab === tab
                ? "bg-[#1F66FF] text-white border-[#1F66FF] font-semibold"
                : "bg-white text-[#475569] border-[#E2E8F0]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {savedMessage && <p role="status" className="w-full rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{savedMessage}</p>}

      {/* Content */}
      {activeTab === "Profile" && (
        <div className="flex min-w-0 flex-col gap-5 w-full p-4 sm:p-6 lg:p-8">
          {/* Profile Card */}
          <div className="flex min-w-0 flex-col p-4 sm:p-6 bg-white w-full border border-neutral-300 rounded-xl gap-5 sm:gap-6">
            <div className="flex items-center gap-2">
              <LuUser size={18} className="text-[#475569]" />
              <h2 className="font-instrument font-bold text-[16px] text-[#0F172A]">Profile Information</h2>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xl font-bold text-blue-600">
                {profileImage ? <img src={profileImage} alt="Profile preview" className="h-full w-full object-cover" /> : (fullName.trim()[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block font-instrument text-[12px] font-semibold text-[#475569]">PROFILE PICTURE</label>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0] || null; if (file && file.size > 5 * 1024 * 1024) { setSavedMessage("Choose an image smaller than 5 MB."); event.target.value = ""; return; } setProfileFile(file); if (file) setProfileImage(URL.createObjectURL(file)); }} className="w-full cursor-pointer rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-semibold file:text-blue-600" />
                <p className="mt-1 text-xs text-slate-500">Upload JPG, PNG, or WebP from your device (max 5 MB).{profileFile ? ` Selected: ${profileFile.name}` : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-instrument font-semibold text-[12px] text-[#475569]">FULL NAME</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-instrument text-[14px] text-[#0F172A] outline-none focus:border-[#1F66FF] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-instrument font-semibold text-[12px] text-[#475569]">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  aria-readonly="true"
                  className="cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-neutral-100 px-4 py-2.5 font-instrument text-[14px] text-[#64748B] outline-none"
                />
                <p className="text-xs text-slate-500">Email address cannot be changed here.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-instrument font-semibold text-[12px] text-[#475569]">ROLE</label>
                <input
                  type="text"
                  value={role || "Reviewer"}
                  disabled
                  className="px-4 py-2.5 bg-neutral-100 border border-[#E2E8F0] rounded-lg font-instrument text-[14px] text-[#475569] outline-none capitalize cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-instrument font-semibold text-[12px] text-[#475569]">ORGANIZATION</label>
                <input
                  type="text"
                  value={activeOrg?.name || "—"}
                  disabled
                  className="px-4 py-2.5 bg-neutral-100 border border-[#E2E8F0] rounded-lg font-instrument text-[14px] text-[#475569] outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" disabled={savingProfile || !fullName.trim()} onClick={async () => {
                setSavingProfile(true); setSavedMessage("");
                try {
                  let imageToSave = profileImage;
                  if (profileFile) {
                    const form = new FormData(); form.append("file", profileFile);
                    const response = await fetch("/api/profile/avatar", { method: "POST", body: form });
                    const body = await response.json(); if (!response.ok) throw new Error(body.error || "Could not upload profile picture.");
                    imageToSave = body.imageUrl;
                  }
                  const result = await authClient.updateUser({ name: fullName.trim(), image: imageToSave || null });
                  if (result.error) throw new Error(result.error.message || "Could not update profile.");
                  const refreshed = await authClient.getSession();
                  if (refreshed.data?.user) { useUserStore.getState().setUser(refreshed.data.user as unknown as User); setFullName(refreshed.data.user.name || ""); setProfileImage(refreshed.data.user.image || ""); setProfileFile(null); }
                  setSavedMessage("Your profile was updated successfully.");
                } catch (error) { setSavedMessage(error instanceof Error ? error.message : "Could not update profile."); }
                finally { setSavingProfile(false); }
              }} className="cursor-pointer rounded-lg bg-[#1F66FF] px-5 py-2.5 font-instrument text-[13px] font-semibold text-white transition-colors hover:bg-[#1a5ae0] disabled:cursor-not-allowed disabled:opacity-60">{savingProfile ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="flex min-w-0 flex-col gap-5 w-full p-4 sm:p-6 lg:p-8">
          {/* Notifications Card */}
          <div className="flex min-w-0 flex-col p-4 sm:p-6 bg-white w-full border border-neutral-300 rounded-xl gap-5 sm:gap-6">
            <div className="flex items-center gap-2">
              <LuBell size={18} className="text-[#475569]" />
              <h2 className="font-instrument font-bold text-[16px] text-[#0F172A]">Notification Preferences</h2>
            </div>

            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {/* Toggle Row */}
              <div className="flex items-center justify-between py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-instrument font-semibold text-[14px] text-[#0F172A]">Email Notifications</span>
                  <span className="font-instrument text-[13px] text-[#475569]">Receive email notifications for important updates</span>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${emailNotifications ? "bg-[#1F66FF]" : "bg-neutral-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifications ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-instrument font-semibold text-[14px] text-[#0F172A]">Claim Updates</span>
                  <span className="font-instrument text-[13px] text-[#475569]">Get notified when a claim status changes</span>
                </div>
                <button
                  onClick={() => setClaimUpdates(!claimUpdates)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${claimUpdates ? "bg-[#1F66FF]" : "bg-neutral-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${claimUpdates ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-instrument font-semibold text-[14px] text-[#0F172A]">Review Assignments</span>
                  <span className="font-instrument text-[13px] text-[#475569]">Get notified when a new claim is assigned to you</span>
                </div>
                <button
                  onClick={() => setReviewAssignments(!reviewAssignments)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${reviewAssignments ? "bg-[#1F66FF]" : "bg-neutral-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${reviewAssignments ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end"><button type="button" onClick={savePreferences} className="px-5 py-2.5 bg-[#1F66FF] text-white font-instrument font-semibold text-[13px] rounded-lg hover:bg-[#1a5ae0] transition-colors cursor-pointer">Save preferences</button></div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="flex min-w-0 flex-col gap-5 w-full p-4 sm:p-6 lg:p-8">
          {/* Password changes are handled by the configured authentication provider. */}
          <div className="flex min-w-0 flex-col p-4 sm:p-6 bg-white w-full border border-neutral-300 rounded-xl gap-5 sm:gap-6">
            <div className="flex items-center gap-2">
              <LuShield size={18} className="text-[#475569]" />
              <h2 className="font-instrument font-bold text-[16px] text-[#0F172A]">Account security</h2>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-600">AutoClaimAI currently uses Google sign-in through Better Auth. Password changes are managed by your identity provider, so there is no local password to update here. Keep your Google account protected with two-step verification.</p>

              
            </div>

          {/* Danger Zone */}
          <div className="flex flex-col p-6 bg-white w-full border border-red-200 rounded-xl gap-4">
            <div className="flex items-center gap-2">
              <LuLogOut size={18} className="text-red-500" />
              <h2 className="font-instrument font-bold text-[16px] text-red-600">Danger Zone</h2>
            </div>
            <p className="font-instrument text-[13px] leading-6 text-[#475569]">Account removal and workspace access changes are managed by your organization administrator. Contact your workspace owner if you need your access changed.</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useOrgStore } from "@/app/store/org-store";
import { LuCar, LuShield, LuLayoutDashboard, LuFiles, LuUsers, LuSettings, LuMenu, LuX } from "react-icons/lu";
import { TbWheel } from "react-icons/tb";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useUserStore } from "@/app/store/userStore";
interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
    const router = useRouter();
    const activeOrg = useOrgStore((state) => state.activeOrg);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "dashboard";
    const role = useUserStore((state) => state.role);

    const { data: orgs } = authClient.useListOrganizations();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      onMobileClose();
    }, [pathname, currentTab, onMobileClose]);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleOrganizationChange = async (newOrgId: string) => {
      if (!newOrgId) return;
      setIsOpen(false);
      await authClient.organization.setActive({ organizationId: newOrgId });
      const res = await authClient.organization.getActiveMember();

      if (res.data?.role === "reviewer") {
        router.replace("/dashboard/reviewer");
      } else {
        router.replace("/dashboard/admin");
      }
    };

    return (
      <>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onMobileClose}
            className="fixed inset-0 z-[60] bg-slate-950/40 md:hidden"
          />
        )}
        <div className={`${mobileOpen ? "fixed inset-y-0 left-0 z-[65] flex h-dvh w-[min(86vw,320px)] max-w-[calc(100vw-3rem)] overflow-x-hidden overflow-y-auto overscroll-contain bg-neutral-50 pb-6 shadow-xl" : "hidden md:flex md:w-[260px]"} min-h-dvh flex-col gap-6 pl-5 pt-8 pr-4 pb-6 shrink-0 md:min-h-screen`}>
          <div className="flex flex-col gap-9">
            <div className="flex items-center gap-1">
              <TbWheel size={28} />
              <span className="text-black font-instrument font-medium text-[20px]">AutoClaim AI</span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-neutral-500 font-instrument font-semibold text-[12px]" >Workspace</h2>
              <div className="relative" ref={dropdownRef}>
                {orgs && orgs.length > 0 && (
                  <div
                    className="bg-white border border-neutral-300 px-3 py-1.5 rounded-md flex items-center justify-between gap-2 cursor-pointer  transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={activeOrg?.logo || "/images/placeholder.png"} alt="Organization Logo" width={24} height={24} className="h-6 w-6 rounded object-cover" />
                      <span className="font-instrument font-bold text-[12px] tracking-[0.0417em] text-[#475569]">
                        {activeOrg?.name?.toUpperCase() || "SELECT WORKSPACE"}
                      </span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-[#475569] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                )}

                {isOpen && orgs && orgs.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E2E8F0] rounded-md shadow-xl shadow-neutral-900/14 z-50 overflow-hidden">
                    {orgs.map((org) => (
                      <div
                        key={org.id}
                        className={`flex items-center gap-2 px-4 py-2 text-[13px] font-instrument cursor-pointer transition-colors ${activeOrg?.id === org.id ? "bg-neutral-700 font-semibold text-neutral-50" : "text-[#475569] font-medium"}`}
                        onClick={() => handleOrganizationChange(org.id)}
                      >
                        <img src={org.logo || "/images/placeholder.png"} alt="" width={22} height={22} className="h-[22px] w-[22px] rounded object-cover" />
                        <span>{org.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-neutral-500 font-instrument font-semibold text-[12px]" >Menu</h2>
            <div className="flex flex-col gap-3 ">


              <div className="flex flex-col gap-1">
                <Link href={pathname} className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${currentTab === "dashboard" ? "bg-neutral-800 text-white" : "hover:bg-neutral-200"}`}
                >
                  <LuLayoutDashboard size={18} className={currentTab === "dashboard" ? "text-white" : "text-neutral-500"} />
                  <span className={`font-instrument font-semibold text-[14px] flex-1 ${currentTab === "dashboard" ? "text-white" : "text-neutral-500"}`}>Dashboard</span>
                  {currentTab === "dashboard" && <div className="w-0.5 h-4 bg-white rounded-sm"></div>}
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <Link href={`${pathname}?tab=claims`} className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${currentTab === "claims" ? "bg-neutral-800 text-white" : "hover:bg-neutral-200"}`}
                >
                  <LuFiles size={18} className={currentTab === "claims" ? "text-white" : "text-neutral-500"} />
                  <span className={`font-instrument font-semibold text-[14px] flex-1 ${currentTab === "claims" ? "text-white" : "text-neutral-500"}`}>Claims</span>
                  {currentTab === "claims" && <div className="w-0.5 h-4 bg-white rounded-sm"></div>}
                </Link>
              </div>

              {role == "admin" && <div className="flex flex-col gap-1">
                <Link href={`${pathname}?tab=reviewers`} className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${currentTab === "reviewers" ? "bg-neutral-800 text-white" : "hover:bg-neutral-200 transition-colors"}`}>
                  <LuUsers size={18} className={currentTab === "reviewers" ? "text-white" : "text-neutral-500"} />
                  <span className={`font-instrument font-semibold text-[14px] flex-1 ${currentTab === "reviewers" ? "text-white" : "text-neutral-500"}`}>Reviewers</span>
                  {currentTab === "reviewers" && <div className="w-0.5 h-4 bg-white rounded-sm"></div>}
                </Link>
              </div>}

              <div className="flex flex-col gap-1">
                <Link href={`${pathname}?tab=settings`} className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${currentTab === "settings" ? "bg-neutral-800 text-white" : "hover:bg-neutral-200"}`}
                >
                  <LuSettings size={18} className={currentTab === "settings" ? "text-white" : "text-neutral-500"} />
                  <span className={`font-instrument font-semibold text-[14px] flex-1 ${currentTab === "settings" ? "text-white" : "text-neutral-500"}`}>Settings</span>
                  {currentTab === "settings" && <div className="w-0.5 h-4 bg-white rounded-sm"></div>}
                </Link>
              </div>


            </div>
          </div>


        </div>
      </>
    );
  }


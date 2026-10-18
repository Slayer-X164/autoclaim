"use client"
import { Suspense, useCallback, useState } from "react";
import Sidebar from "@/component/dashboard/Sidebar";
import Header from "@/component/dashboard/Header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  return (
    <div className="dashboard-shell flex min-h-dvh w-full min-w-0 overflow-x-clip bg-neutral-100 md:h-dvh md:overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />
      </Suspense>
      <div className="dashboard-main m-0 flex min-h-dvh min-w-0 flex-1 flex-col overflow-visible border-0 bg-white  sm:m-2 sm:rounded-xl sm:border-2 sm:border-neutral-200/80 sm:pt-0 md:min-h-0 md:overflow-hidden md:m-4 md:border-3 md:pt-0">
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() =>
            setMobileMenuOpen((open) => !open)
          }
        />
        <div className="dashboard-scroll min-w-0 flex-1 overflow-visible overscroll-contain md:overflow-y-auto">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

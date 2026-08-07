import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { OlfactusOnboarding } from "@/components/os/olfactus-onboarding";
import { GlobalOlfactusAnalyst } from "@/components/intelligence/global-olfactus-analyst";
import { BreadcrumbBar } from "@/components/navigation/breadcrumb-bar";
import { CommandPalette } from "@/components/navigation/command-palette";
import { ActiveCatalogStatus } from "@/components/catalog/active-catalog-status";
import { SyncStatusControl } from "@/components/account/sync-status";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nexus-app-shell min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="nexus-topbar">
          <BreadcrumbBar />
          <div className="flex items-center gap-2">
            <SyncStatusControl />
            <ActiveCatalogStatus />
            <CommandPalette />
          </div>
        </header>
        <main className="nexus-page-content mx-auto w-full max-w-[1560px] px-4 pb-24 pt-5 sm:px-7 lg:px-10 lg:pb-16 lg:pt-6">
          <div className="nexus-page-transition">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <OlfactusOnboarding />
      <GlobalOlfactusAnalyst />
    </div>
  );
}

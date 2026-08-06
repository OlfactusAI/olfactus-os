import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { OlfactusOnboarding } from "@/components/os/olfactus-onboarding";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-24 pt-7 sm:px-7 lg:px-10 lg:pb-16 lg:pt-9">
        {children}
      </main>
      <MobileNav />
      <OlfactusOnboarding />
    </div>
  );
}

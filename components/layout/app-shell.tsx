import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="relative mx-auto w-full max-w-[1720px] px-4 pb-28 pt-5 sm:px-7 lg:px-10 lg:pb-16 lg:pt-8 2xl:px-14">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(232,200,127,.22),transparent)]" />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

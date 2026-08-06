"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom, CircleUserRound, Command, Compass, FlaskConical, LibraryBig, Network, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { href: "/today", label: "Command Center", icon: Command },
  { href: "/collection", label: "Collection Intelligence", icon: LibraryBig },
  { href: "/discover", label: "Discovery Engine", icon: Compass },
  { href: "/decisions", label: "Decision Lab", icon: FlaskConical },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar-surface sticky top-0 hidden h-screen w-[292px] shrink-0 border-r border-[var(--border)] lg:flex lg:flex-col">
      <div className="px-7 pb-7 pt-8">
        <Link href="/today" className="flex items-center gap-3">
          <span className="brand-orb grid h-10 w-10 place-items-center rounded-full"><Sparkles size={17} /></span>
          <div><p className="display-serif text-[25px] tracking-[.16em]">OLFACTUS</p><p className="mt-1 text-[.58rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">Fragrance Intelligence</p></div>
        </Link>
      </div>
      <div className="px-4">
        <p className="px-4 text-[.58rem] font-bold uppercase tracking-[.2em] text-[var(--muted-dim)]">Intelligence modules</p>
        <nav className="mt-3 grid gap-1.5">
          {primaryItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return (
            <Link key={href} href={href} className={cn("focus-ring sidebar-link group relative flex min-h-[52px] items-center gap-3.5 rounded-2xl px-4 text-sm transition", active ? "sidebar-link-active text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-white/[.035] hover:text-[var(--foreground)]")}>
              {active && <span className="absolute left-0 h-7 w-[2px] rounded-full bg-[var(--gold-bright)] shadow-[0_0_12px_rgba(232,200,127,.55)]" />}
              <span className={cn("grid h-8 w-8 place-items-center rounded-xl border transition", active ? "border-[rgba(232,200,127,.24)] bg-[rgba(232,200,127,.08)] text-[var(--gold-bright)]" : "border-transparent text-[var(--muted)] group-hover:border-[var(--border)]")}><Icon size={17} /></span>
              <span className="font-medium">{label}</span>
            </Link>
          )})}
        </nav>
      </div>
      <div className="mt-7 px-4">
        <p className="px-4 text-[.58rem] font-bold uppercase tracking-[.2em] text-[var(--muted-dim)]">Intelligence horizon</p>
        {[{label:"Knowledge Graph",icon:Network},{label:"Fragrance Genome",icon:Atom}].map(({label,icon:Icon}) => (
          <div key={label} className="mt-1.5 flex min-h-[46px] items-center gap-3.5 rounded-2xl px-4 text-sm text-[var(--muted-dim)]"><span className="grid h-8 w-8 place-items-center"><Icon size={16}/></span><span>{label}</span><span className="ml-auto rounded-full border border-[var(--border)] px-2 py-1 text-[.52rem] font-bold tracking-[.12em]">SOON</span></div>
        ))}
      </div>
      <div className="mt-auto p-5">
        <div className="neural-dock rounded-[22px] border border-[rgba(232,200,127,.18)] p-4">
          <div className="flex items-center justify-between"><div><p className="text-[.6rem] font-bold uppercase tracking-[.18em] text-[var(--muted)]">Neural Core</p><p className="mt-1 text-sm font-semibold">Online</p></div><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-30"/><span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--success)] shadow-[0_0_12px_rgba(79,166,122,.6)]"/></span></div>
          <div className="mt-4 flex items-end justify-between"><div><p className="display-serif text-3xl text-[var(--gold-bright)]">93%</p><p className="mt-1 text-[.62rem] text-[var(--muted)]">System confidence</p></div><p className="text-right text-[.58rem] leading-4 text-[var(--muted-dim)]">NC-1.0<br/>v0.5.0</p></div>
        </div>
        <Link href="/profile" className="focus-ring mt-3 flex min-h-[48px] items-center gap-3 rounded-2xl px-4 text-sm text-[var(--muted)] transition hover:bg-white/[.035] hover:text-[var(--foreground)]"><CircleUserRound size={18}/><span>Profile & Preferences</span></Link>
      </div>
    </aside>
  );
}

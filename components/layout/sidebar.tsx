"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beaker,
  Compass,
  FlaskConical,
  LayoutDashboard,
  Library,
  UserRound,
} from "lucide-react";

const items = [
  { href: "/today", label: "Today", icon: LayoutDashboard },
  { href: "/collection", label: "Collection", icon: Library },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/decisions", label: "Decisions", icon: FlaskConical },
  { href: "/profile", label: "Coach & Profile", icon: UserRound },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 border-r border-[var(--border)] bg-[rgba(9,10,12,.96)] p-[26px_18px] lg:flex lg:flex-col">
      <Link
        href="/today"
        className="display-serif px-3 text-[26px] tracking-[.13em]"
      >
        OLFACTUS
      </Link>
      <p className="mt-2 px-3 text-[.56rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
        Neural Operating System
      </p>

      <nav className="mt-8 grid gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                active
                  ? "bg-[rgba(232,200,127,.09)] text-[var(--gold-bright)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="os-status-panel mt-auto rounded-2xl border border-[var(--border)] p-4">
        <p className="text-[.56rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
          System status
        </p>
        <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-2">
            <Beaker size={13} className="text-[var(--success)]" />
            Neural Core online
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            7 engines synchronized
          </span>
        </div>
        <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
          OLFACTUS OS v1.0.0 · Stable
        </p>
      </div>
    </aside>
  );
}

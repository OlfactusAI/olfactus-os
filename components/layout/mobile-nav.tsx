import Link from "next/link";
import {
  Compass,
  Dna,
  FlaskConical,
  History,
  LayoutDashboard,
  Library,
  Network,
  Landmark,
  BadgeDollarSign,
  UserRound,
} from "lucide-react";

const items = [
  {
    href: "/today",
    label: "Today",
    icon: LayoutDashboard,
  },
  {
    href: "/collection",
    label: "Collection",
    icon: Library,
  },
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
  },
  {
    href: "/genome",
    label: "Genome",
    icon: Dna,
  },
  {
    href: "/timeline",
    label: "Timeline",
    icon: History,
  },
  {
    href: "/graph",
    label: "Graph",
    icon: Network,
  },
  {
    href: "/market",
    label: "Market",
    icon: Landmark,
  },
  {
    href: "/deal-lab",
    label: "Deal Lab",
    icon: BadgeDollarSign,
  },
  {
    href: "/decisions",
    label: "Decisions",
    icon: FlaskConical,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
] as const;

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-[var(--border)] bg-[rgba(9,10,12,.97)] lg:hidden">
      {items.map(
        ({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="focus-ring grid min-h-16 min-w-[76px] flex-1 place-items-center gap-1 px-2 py-2 text-[10px] text-[var(--muted)]"
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ),
      )}
    </nav>
  );
}

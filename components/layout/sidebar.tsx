import Link from "next/link";
import { Beaker, Compass, FlaskConical, LayoutDashboard, Library, UserRound } from "lucide-react";

const items=[
  {href:"/today",label:"Today",icon:LayoutDashboard},
  {href:"/collection",label:"Collection",icon:Library},
  {href:"/decisions",label:"Decisions",icon:FlaskConical},
  {href:"/discover",label:"Discover",icon:Compass},
  {href:"/profile",label:"Profile",icon:UserRound},
] as const;

export function Sidebar(){return <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 border-r border-[var(--border)] bg-[rgba(9,10,12,.96)] p-[26px_18px] lg:flex lg:flex-col"><Link href="/today" className="display-serif px-3 text-[26px] tracking-[.13em]">OLFACTUS</Link><nav className="mt-8 grid gap-2">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"><Icon size={18}/>{label}</Link>)}</nav><div className="mt-auto border-t border-[var(--border)] px-3 pt-4 text-xs leading-5 text-[var(--muted)]"><span className="flex items-center gap-2 text-[var(--success)]"><Beaker size={14}/> CHE-1.0 connected</span><br/>OLFACTUS OS v0.1</div></aside>}

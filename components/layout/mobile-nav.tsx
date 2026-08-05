import Link from "next/link";
import { Compass, FlaskConical, LayoutDashboard, Library, UserRound } from "lucide-react";
const items=[{href:"/today",label:"Today",icon:LayoutDashboard},{href:"/collection",label:"Collection",icon:Library},{href:"/decisions",label:"Decisions",icon:FlaskConical},{href:"/discover",label:"Discover",icon:Compass},{href:"/profile",label:"Profile",icon:UserRound}] as const;
export function MobileNav(){return <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-[rgba(9,10,12,.97)] lg:hidden">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} className="focus-ring grid min-h-16 place-items-center gap-1 px-1 py-2 text-[10px] text-[var(--muted)]"><Icon size={18}/><span>{label}</span></Link>)}</nav>}

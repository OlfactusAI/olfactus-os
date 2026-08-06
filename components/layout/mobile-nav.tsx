"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, Command, Compass, FlaskConical, LibraryBig } from "lucide-react";
import { cn } from "@/lib/utils";
const items=[{href:"/today",label:"Command",icon:Command},{href:"/collection",label:"Collection",icon:LibraryBig},{href:"/discover",label:"Discover",icon:Compass},{href:"/decisions",label:"Decisions",icon:FlaskConical},{href:"/profile",label:"Profile",icon:CircleUserRound}] as const;
export function MobileNav(){ const pathname=usePathname(); return <nav className="mobile-dock fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[22px] border border-[var(--border)] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:hidden">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} className={cn("focus-ring grid min-h-[58px] place-items-center gap-1 rounded-2xl px-1 py-2 text-[9px] transition",pathname===href?"bg-[rgba(232,200,127,.1)] text-[var(--gold-bright)]":"text-[var(--muted)]")}><Icon size={18}/><span>{label}</span></Link>)}</nav> }

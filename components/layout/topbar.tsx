"use client";
import { usePathname } from "next/navigation";
import { CalendarDays, CloudSun, Radio } from "lucide-react";
const pages: Record<string,{eyebrow:string;title:string}> = {
  "/today": { eyebrow:"Neural command", title:"Command Center" },
  "/collection": { eyebrow:"Collection systems", title:"Collection Intelligence" },
  "/discover": { eyebrow:"Curated exploration", title:"Discovery Engine" },
  "/decisions": { eyebrow:"Purchase analysis", title:"Decision Lab" },
  "/profile": { eyebrow:"Personal intelligence", title:"Profile" },
};
export function Topbar(){ const pathname=usePathname(); const page=pages[pathname]??pages["/today"]; const date=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric"}).format(new Date()); return <header className="topbar-surface sticky top-0 z-20 hidden h-[82px] items-center border-b border-[var(--border)] px-10 backdrop-blur-2xl lg:flex 2xl:px-14"><div><p className="text-[.58rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">{page.eyebrow}</p><p className="display-serif mt-1 text-xl">{page.title}</p></div><div className="ml-auto flex items-center gap-2"><div className="topbar-chip"><CloudSun size={15}/><span>94°F · Humid</span></div><div className="topbar-chip"><CalendarDays size={15}/><span>{date}</span></div><div className="topbar-chip border-[rgba(79,166,122,.22)] text-[var(--success)]"><Radio size={14}/><span>AI Ready</span></div></div></header> }

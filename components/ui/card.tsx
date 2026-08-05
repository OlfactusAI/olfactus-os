import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({className,...props}:HTMLAttributes<HTMLDivElement>){return <div className={cn("rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(24,28,34,.95),rgba(17,20,25,.96))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.18)]",className)} {...props}/>}

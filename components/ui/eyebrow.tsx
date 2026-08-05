import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Eyebrow({className,...props}:HTMLAttributes<HTMLParagraphElement>){return <p className={cn("mb-0 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--gold)]",className)} {...props}/>}

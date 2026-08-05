import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("focus-ring inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { primary:"bg-[var(--gold)] text-[#17130c] hover:brightness-105", secondary:"border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--foreground)] hover:border-[rgba(200,168,102,.35)]", ghost:"text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]" } },
  defaultVariants: { variant:"secondary" },
});

export function Button({className,variant,...props}:ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof buttonVariants>){return <button className={cn(buttonVariants({variant}),className)} {...props}/>}

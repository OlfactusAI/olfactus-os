"use client";

import { Heart, Minus, Plus, SprayCan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { cn } from "@/lib/utils";

interface FragranceCardProps {
  fragrance: FragranceRecord;
  item?: CollectionItem;
  onAdd?: () => void;
  onRemove?: () => void;
  onLogWear?: () => void;
  onToggleFavorite?: () => void;
}

export function FragranceCard({
  fragrance,
  item,
  onAdd,
  onRemove,
  onLogWear,
  onToggleFavorite,
}: FragranceCardProps) {
  return (
    <Card className="group flex min-h-80 flex-col transition duration-200 hover:-translate-y-0.5 hover:border-[color:rgba(200,168,102,.32)]">
      <div className="relative mb-5 grid h-32 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="h-24 w-16 rounded-[15px_15px_7px_7px] bg-[linear-gradient(180deg,rgba(255,255,255,.18),rgba(200,168,102,.13))] shadow-2xl transition duration-200 group-hover:-translate-y-1" />
        {item && (
          <button
            type="button"
            aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
            onClick={onToggleFavorite}
            className="focus-ring absolute right-3 top-3 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2"
          >
            <Heart className={cn("h-4 w-4", item.favorite && "fill-[var(--gold)] text-[var(--gold)]")} />
          </button>
        )}
      </div>
      <h3 className="text-lg font-semibold">{fragrance.name}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{fragrance.brand} · {fragrance.concentration}</p>
      <p className="mt-4 text-sm text-[var(--muted)]">{fragrance.family}</p>
      {item ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-[var(--surface-soft)] p-2"><strong className="block text-sm text-[var(--foreground)]">{item.wearCount}</strong><span className="text-[var(--muted)]">wears</span></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-2"><strong className="block text-sm text-[var(--foreground)]">{item.daysSinceLastWear}d</strong><span className="text-[var(--muted)]">last worn</span></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-2"><strong className="block text-sm text-[var(--foreground)]">{item.personalRating || "—"}</strong><span className="text-[var(--muted)]">rating</span></div>
          </div>
          <div className="mt-auto flex gap-2 pt-5">
            <Button className="flex-1" onClick={onLogWear}><SprayCan className="h-4 w-4" /> Log wear</Button>
            <Button aria-label="Remove fragrance" onClick={onRemove}><Minus className="h-4 w-4" /></Button>
          </div>
        </>
      ) : (
        <Button variant="primary" className="mt-auto" onClick={onAdd}><Plus className="h-4 w-4" /> Add fragrance</Button>
      )}
    </Card>
  );
}

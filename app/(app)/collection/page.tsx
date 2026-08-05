"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { FragranceCard } from "@/components/features/fragrance-card";
import { PageHeader } from "@/components/features/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useCollection } from "@/components/providers/collection-provider";
import type { CollectionSort } from "@/lib/collection/store";

export default function CollectionPage() {
  const { owned, available, analysis, addFragrance, removeFragrance, logWear, toggleFavorite, resetCollection } = useCollection();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [sort, setSort] = useState<CollectionSort>("name");
  const [showCatalog, setShowCatalog] = useState(false);

  const families = useMemo(() => ["all", ...new Set(owned.map(({ fragrance }) => fragrance.family))], [owned]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...owned]
      .filter(({ fragrance }) => family === "all" || fragrance.family === family)
      .filter(({ fragrance }) => !normalized || `${fragrance.name} ${fragrance.brand} ${fragrance.family}`.toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sort === "rating") return (b.item.personalRating ?? 0) - (a.item.personalRating ?? 0);
        if (sort === "wears") return b.item.wearCount - a.item.wearCount;
        if (sort === "last-worn") return a.item.daysSinceLastWear - b.item.daysSinceLastWear;
        return a.fragrance.name.localeCompare(b.fragrance.name);
      });
  }, [family, owned, query, sort]);

  const totalWears = owned.reduce((sum, entry) => sum + entry.item.wearCount, 0);
  const favorites = owned.filter((entry) => entry.item.favorite).length;
  const neglected = owned.filter((entry) => entry.item.daysSinceLastWear > 30).length;

  return (
    <>
      <PageHeader eyebrow="Your fragrance library" title="Collection" description="Manage what you own and watch every change flow into OLFACTUS intelligence." />

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Bottles", owned.length],
          ["Total wears", totalWears],
          ["Favorites", favorites],
          ["Health", analysis.score],
        ].map(([label, value]) => (
          <Card key={label} className="p-5"><Eyebrow>{label}</Eyebrow><p className="display-serif mt-3 text-4xl text-[var(--gold)]">{value}</p></Card>
        ))}
      </section>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              aria-label="Search collection"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by fragrance, house, or family"
              className="focus-ring min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-[var(--foreground)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <select value={family} onChange={(event) => setFamily(event.target.value)} className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-8 text-sm">
                {families.map((option) => <option key={option} value={option}>{option === "all" ? "All families" : option}</option>)}
              </select>
            </label>
            <select value={sort} onChange={(event) => setSort(event.target.value as CollectionSort)} className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm">
              <option value="name">Sort: Name</option><option value="rating">Sort: Rating</option><option value="wears">Sort: Wear count</option><option value="last-worn">Sort: Recently worn</option>
            </select>
            <Button variant="primary" onClick={() => setShowCatalog((value) => !value)}>{showCatalog ? "Close catalog" : "Add fragrance"}</Button>
            <Button onClick={resetCollection}><RotateCcw className="h-4 w-4" /> Reset</Button>
          </div>
        </div>
      </Card>

      {showCatalog && (
        <Card className="mb-6">
          <Eyebrow>Available catalog</Eyebrow>
          <h2 className="display-serif mt-3 text-3xl">Add intelligence-ready fragrances</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Adding a fragrance immediately updates Collection Health and the Today briefing.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.length ? available.map((fragrance) => <FragranceCard key={fragrance.id} fragrance={fragrance} onAdd={() => addFragrance(fragrance.id)} />) : <p className="text-[var(--muted)]">Every calibration fragrance is already in your collection.</p>}
          </div>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between gap-4"><p className="text-sm text-[var(--muted)]">Showing {filtered.length} of {owned.length} fragrances</p><p className="text-sm text-[var(--muted)]">{neglected} need rotation</p></div>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map(({ item, fragrance }) => (
          <FragranceCard key={item.fragranceId} fragrance={fragrance} item={item} onLogWear={() => logWear(fragrance.id)} onRemove={() => removeFragrance(fragrance.id)} onToggleFavorite={() => toggleFavorite(fragrance.id)} />
        ))}
      </section>
      {!filtered.length && <Card className="mt-4 text-center"><h2 className="display-serif text-3xl">No fragrances found</h2><p className="mt-3 text-[var(--muted)]">Adjust the search or family filter.</p></Card>}
    </>
  );
}

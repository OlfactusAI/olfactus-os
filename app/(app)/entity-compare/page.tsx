"use client";

import Link from "next/link";
import { GitCompareArrows, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import { buildEntityRegistry } from "@/lib/entities/registry";
import { searchEntityRegistry } from "@/lib/search/entity-search";
import type { RegisteredEntity } from "@/lib/entities/types";

export default function EntityComparePage() {
  const { catalog } = useActiveFragranceCatalog();
  const registry = useMemo(
    () => buildEntityRegistry(catalog),
    [catalog],
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RegisteredEntity[]>([]);

  const results = useMemo(
    () =>
      searchEntityRegistry({
        registry,
        query,
        limit: 12,
      }).filter((result) =>
        ["fragrance", "brand", "perfumer"].includes(result.type),
      ),
    [registry, query],
  );

  function add(entity: RegisteredEntity) {
    setSelected((current) =>
      current.some(
        (item) => item.canonicalId === entity.canonicalId,
      ) || current.length >= 3
        ? current
        : [...current, entity],
    );
  }

  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">Entity Comparison</p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Compare connected
            <br />
            <span className="text-[var(--gold-bright)]">
              intelligence entities.
            </span>
          </h1>
        </div>
        <GitCompareArrows
          size={52}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="entity-compare-search mt-7">
        <Search size={15} />
        <input
          value={query}
          placeholder="Search fragrances, brands, or perfumers"
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {query ? (
        <section className="entity-compare-results">
          {results.map((result) => {
            const entity = registry.byCanonicalId.get(result.id);
            if (!entity) return null;
            return (
              <button
                key={result.id}
                type="button"
                onClick={() => add(entity)}
              >
                <small>{result.type}</small>
                <strong>{result.label}</strong>
                <span>{result.confidence}% confidence</span>
              </button>
            );
          })}
        </section>
      ) : null}

      <section className="entity-compare-grid mt-6">
        {selected.map((entity) => (
          <article
            key={entity.canonicalId}
            className="layer3-panel"
          >
            <button
              className="entity-compare-remove"
              onClick={() =>
                setSelected((current) =>
                  current.filter(
                    (item) =>
                      item.canonicalId !== entity.canonicalId,
                  ),
                )
              }
            >
              <X size={13} />
            </button>
            <small>{entity.type}</small>
            <h2 className="display-serif mt-3 text-4xl">
              {entity.label}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {entity.subtitle ?? entity.slug}
            </p>
            <div className="entity-compare-metrics mt-5">
              <div>
                <span>Confidence</span>
                <strong>{entity.confidence}%</strong>
              </div>
              <div>
                <span>Connections</span>
                <strong>{entity.relationships.length}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{entity.status}</strong>
              </div>
            </div>
            <Link
              href={`/entity/${entity.type}/${entity.id}`}
              className="layer3-secondary mt-5"
            >
              Open dossier
            </Link>
          </article>
        ))}

        {!selected.length ? (
          <div className="entity-compare-empty">
            Select up to three fragrances, brands, or perfumers.
          </div>
        ) : null}
      </section>
    </div>
  );
}

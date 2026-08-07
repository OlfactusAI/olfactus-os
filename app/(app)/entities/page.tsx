"use client";

import Link from "next/link";
import {
  Database,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import {
  useActiveFragranceCatalog,
} from "@/components/providers/active-catalog-provider";
import {
  buildEntityRegistry,
} from "@/lib/entities/registry";
import type {
  EntityType,
} from "@/lib/entities/types";

const filters:
  Array<
    "all" | EntityType
  > = [
    "all",
    "fragrance",
    "brand",
    "perfumer",
    "note",
    "accord",
    "family",
  ];

export default function EntityExplorerPage() {
  const {
    catalog,
  } =
    useActiveFragranceCatalog();
  const [
    query,
    setQuery,
  ] = useState("");
  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" | EntityType
    >("all");

  const registry =
    useMemo(
      () =>
        buildEntityRegistry(
          catalog,
        ),
      [catalog],
    );
  const normalized =
    query
      .trim()
      .toLowerCase();
  const visible =
    registry.entities.filter(
      (entity) =>
        (filter ===
          "all" ||
          entity.type ===
            filter) &&
        (!normalized ||
          [
            entity.label,
            entity.subtitle,
            entity.slug,
            ...entity.aliases,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    normalized,
                  ),
            )),
    );

  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">
            Dynamic Entity Platform
          </p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Every record becomes
            <br />
            <span className="text-[var(--gold-bright)]">
              a living intelligence page.
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-[var(--muted)]">
            The registry is generated from the active catalog. New imported fragrances, brands, perfumers, notes, accords, and families appear automatically.
          </p>
        </div>
        <Database
          size={52}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="entity-browser-toolbar mt-7">
        <label>
          <Search
            size={15}
          />
          <input
            value={query}
            placeholder="Search every entity"
            onChange={(
              event,
            ) =>
              setQuery(
                event.target
                  .value,
              )
            }
          />
        </label>
        <div>
          {filters.map(
            (value) => (
              <button
                key={value}
                type="button"
                className={
                  filter ===
                  value
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setFilter(
                    value,
                  )
                }
              >
                {value}
              </button>
            ),
          )}
        </div>
      </section>

      <section className="entity-browser-stats">
        <article>
          <small>
            Active entities
          </small>
          <strong>
            {
              registry.entities
                .length
            }
          </strong>
        </article>
        <article>
          <small>
            Relationships
          </small>
          <strong>
            {
              registry.relationships
                .length
            }
          </strong>
        </article>
        <article>
          <small>
            Active fragrances
          </small>
          <strong>
            {
              catalog.length
            }
          </strong>
        </article>
      </section>

      <section className="entity-browser-grid">
        {visible.map(
          (entity) => (
            <Link
              key={
                entity.canonicalId
              }
              href={`/entity/${entity.type}/${entity.id}`}
            >
              <small>
                {
                  entity.type
                }
              </small>
              <strong>
                {
                  entity.label
                }
              </strong>
              <p>
                {
                  entity.subtitle ??
                  `${entity.relationships.length} connections`
                }
              </p>
              <span>
                {
                  entity.confidence
                }
                % confidence
              </span>
            </Link>
          ),
        )}
      </section>
    </div>
  );
}

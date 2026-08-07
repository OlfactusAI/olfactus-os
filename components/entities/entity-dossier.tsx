"use client";

import Link from "next/link";
import {
  ArrowRight,
  Database,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";

import type {
  RegisteredEntity,
} from "@/lib/entities/types";

export function EntityDossier({
  entity,
}: {
  entity:
    RegisteredEntity;
}) {
  const metadata =
    entity.metadata;
  const relationships =
    deduplicateRelationships(
      entity.relationships,
    );

  return (
    <main className="entity-dossier-shell">
      <header className="entity-dossier-hero">
        <div>
          <p className="layer3-kicker">
            Universal Entity Dossier ·{" "}
            {
              entity.type
            }
          </p>
          <h1 className="display-serif">
            {
              entity.label
            }
          </h1>
          {entity.subtitle ? (
            <p className="entity-subtitle">
              {
                entity.subtitle
              }
            </p>
          ) : null}
        </div>

        <div className="entity-hero-actions">
          <Link
            href={`/entity-compare?entity=${encodeURIComponent(
              entity.canonicalId,
            )}`}
            className="entity-compare-link"
          >
            Compare entity
          </Link>
          <div className="entity-confidence">
          <ShieldCheck
            size={18}
          />
          <span>
            Confidence
          </span>
          <strong>
            {
              entity.confidence
            }
            %
          </strong>
          <small>
            {
              entity.status
            }
          </small>
          </div>
        </div>
      </header>

      <section className="entity-identity-grid">
        <article>
          <small>
            Canonical ID
          </small>
          <strong>
            {
              entity.canonicalId
            }
          </strong>
        </article>
        <article>
          <small>
            Slug
          </small>
          <strong>
            {
              entity.slug
            }
          </strong>
        </article>
        <article>
          <small>
            Aliases
          </small>
          <strong>
            {
              entity.aliases
                .slice(0, 4)
                .join(", ")
            }
          </strong>
        </article>
        <article>
          <small>
            Connections
          </small>
          <strong>
            {
              relationships.length
            }
          </strong>
        </article>
      </section>

      <DynamicMetadataSections
        entity={entity}
      />


      <section className="entity-panel">
        <p className="layer3-kicker">Evidence & Entity History</p>
        <div className="entity-history-grid mt-5">
          <article>
            <small>Validation status</small>
            <strong>{entity.status}</strong>
          </article>
          <article>
            <small>Confidence</small>
            <strong>{entity.confidence}%</strong>
          </article>
          <article>
            <small>Source</small>
            <strong>Active catalog registry</strong>
          </article>
          <article>
            <small>Version</small>
            <strong>Current active record</strong>
          </article>
        </div>
      </section>

      <section className="entity-panel">
        <div className="entity-section-heading">
          <div>
            <p className="layer3-kicker">
              Relationship Network
            </p>
            <h2 className="display-serif">
              Continue through the intelligence graph.
            </h2>
          </div>
          <Network
            size={25}
          />
        </div>

        <div className="entity-relationship-grid">
          {relationships.map(
            (
              relationship,
            ) => {
              const targetCanonicalId =
                relationship.sourceId ===
                entity.canonicalId
                  ? relationship.targetId
                  : relationship.sourceId;
              const [
                targetType,
                ...targetParts
              ] =
                targetCanonicalId.split(
                  ":",
                );
              const targetId =
                targetParts.join(
                  ":",
                );

              return (
                <Link
                  key={
                    relationship.id
                  }
                  href={`/entity/${targetType}/${targetId}`}
                  className="entity-relationship-card"
                >
                  <small>
                    {
                      relationship.type
                    }
                  </small>
                  <strong>
                    {
                      humanize(
                        targetId,
                      )
                    }
                  </strong>
                  <p>
                    {
                      relationship.explanation
                    }
                  </p>
                  <div>
                    <span>
                      {
                        relationship.strength
                      }
                      % strength
                    </span>
                    <ArrowRight
                      size={13}
                    />
                  </div>
                </Link>
              );
            },
          )}

          {!relationships.length ? (
            <div className="entity-empty-section">
              <Database
                size={19}
              />
              No relationships are available for this entity yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function DynamicMetadataSections({
  entity,
}: {
  entity:
    RegisteredEntity;
}) {
  const metadata =
    entity.metadata;

  if (
    entity.type !==
    "fragrance"
  ) {
    return (
      <section className="entity-panel">
        <p className="layer3-kicker">
          Entity Intelligence
        </p>
        <h2 className="display-serif mt-3 text-4xl">
          Connected records
        </h2>
        <p className="mt-4 text-[var(--muted)]">
          This entity is generated automatically from the active fragrance catalog. Its relationship section lists every connected fragrance currently available.
        </p>
      </section>
    );
  }

  const performance =
    asRecord(
      metadata.performance,
    );
  const seasons =
    asRecord(
      metadata.seasons,
    );
  const dna =
    asRecord(
      metadata.dna,
    );
  const notes =
    asRecord(
      metadata.notes,
    );
  const accords =
    asStringArray(
      metadata.accords,
    );
  const perfumers =
    asStringArray(
      metadata.perfumers,
    );
  const roles =
    asStringArray(
      metadata.roles,
    );

  return (
    <>
      <section className="entity-metric-grid">
        <Metric
          label="Concentration"
          value={
            metadata.concentration
          }
        />
        <Metric
          label="Release"
          value={
            metadata.releaseYear
          }
        />
        <Metric
          label="Family"
          value={
            metadata.family
          }
        />
        <Metric
          label="Perfumers"
          value={
            perfumers.length
              ? perfumers.join(
                  ", ",
                )
              : undefined
          }
        />
      </section>

      {Object.keys(
        performance,
      ).length ? (
        <EntitySection
          title="Performance"
          values={
            performance
          }
        />
      ) : null}

      {accords.length ||
      roles.length ? (
        <section className="entity-panel">
          <p className="layer3-kicker">
            Classification
          </p>
          <div className="entity-two-column mt-5">
            {accords.length ? (
              <TagGroup
                title="Accords"
                values={
                  accords
                }
              />
            ) : null}
            {roles.length ? (
              <TagGroup
                title="Roles"
                values={
                  roles
                }
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {Object.keys(
        notes,
      ).length ? (
        <section className="entity-panel">
          <p className="layer3-kicker">
            Notes
          </p>
          <div className="entity-note-grid mt-5">
            {Object.entries(
              notes,
            ).map(
              ([
                level,
                value,
              ]) => (
                <article
                  key={level}
                >
                  <small>
                    {level}
                  </small>
                  <strong>
                    {Array.isArray(
                      value,
                    )
                      ? value.join(
                          ", ",
                        )
                      : String(
                          value,
                        )}
                  </strong>
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}

      {Object.keys(
        seasons,
      ).length ? (
        <EntitySection
          title="Season Fit"
          values={
            seasons
          }
        />
      ) : null}

      {Object.keys(
        dna,
      ).length ? (
        <EntitySection
          title="DNA Profile"
          values={dna}
        />
      ) : null}
    </>
  );
}

function EntitySection({
  title,
  values,
}: {
  title: string;
  values:
    Record<
      string,
      unknown
    >;
}) {
  return (
    <section className="entity-panel">
      <p className="layer3-kicker">
        {title}
      </p>
      <div className="entity-bar-grid mt-5">
        {Object.entries(
          values,
        ).map(
          ([
            label,
            rawValue,
          ]) => {
            const numeric =
              typeof rawValue ===
              "number"
                ? rawValue
                : null;

            return (
              <article
                key={label}
              >
                <div>
                  <span>
                    {
                      humanize(
                        label,
                      )
                    }
                  </span>
                  <strong>
                    {String(
                      rawValue,
                    )}
                  </strong>
                </div>
                {numeric !==
                null ? (
                  <div className="entity-bar-track">
                    <span
                      style={{
                        width:
                          `${Math.max(
                            0,
                            Math.min(
                              100,
                              numeric,
                            ),
                          )}%`,
                      }}
                    />
                  </div>
                ) : null}
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  if (
    value ===
      undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return (
    <article>
      <small>
        {label}
      </small>
      <strong>
        {String(value)}
      </strong>
    </article>
  );
}

function TagGroup({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <div>
      <small>
        {title}
      </small>
      <div className="entity-tags">
        {values.map(
          (value) => (
            <span
              key={value}
            >
              {value}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function asRecord(
  value: unknown,
) {
  return value &&
    typeof value ===
      "object" &&
    !Array.isArray(value)
    ? (value as
        Record<
          string,
          unknown
        >)
    : {};
}

function asStringArray(
  value: unknown,
) {
  return Array.isArray(
    value,
  )
    ? value.map(
        String,
      )
    : [];
}

function humanize(
  value: string,
) {
  return value
    .replace(
      /[-_]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function deduplicateRelationships(
  relationships:
    RegisteredEntity["relationships"],
) {
  return [
    ...new Map(
      relationships.map(
        (
          relationship,
        ) => [
          relationship.id,
          relationship,
        ],
      ),
    ).values(),
  ];
}

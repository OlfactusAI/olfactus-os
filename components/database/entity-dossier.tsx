"use client";

import Link from "next/link";
import {
  Atom,
  Building2,
  CalendarDays,
  Dna,
  FlaskConical,
  GitBranch,
  Layers3,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

import type {
  GlobalFragranceDatabase,
} from "@/lib/database/schema";
import type {
  IngredientEntity,
} from "@/lib/database/core/types";

export function DatabaseEntityDossier({
  database,
  noteId,
  accordId,
  ingredientId,
  ingredients = [],
}: {
  database:
    GlobalFragranceDatabase;
  noteId?: string | null;
  accordId?: string | null;
  ingredientId?: string | null;
  ingredients?: IngredientEntity[];
}) {
  const note =
    noteId
      ? database.notes.find(
          (item) =>
            item.id === noteId,
        ) ?? null
      : null;
  const accord =
    accordId
      ? database.accords.find(
          (item) =>
            item.id === accordId,
        ) ?? null
      : null;
  const ingredient =
    ingredientId
      ? ingredients.find(
          (item) =>
            item.id ===
            ingredientId,
        ) ?? null
      : null;

  if (
    !note &&
    !accord &&
    !ingredient
  ) {
    return null;
  }

  if (note) {
    const fragrances =
      database.fragrances.filter(
        (fragrance) =>
          [
            ...fragrance.noteIds.top,
            ...fragrance.noteIds.heart,
            ...fragrance.noteIds.base,
          ].includes(note.id),
      );
    const accords =
      database.accords.filter(
        (item) =>
          item.relatedNoteIds.includes(
            note.id,
          ),
      );
    const brands =
      unique(
        fragrances.map(
          (fragrance) =>
            fragrance.brand,
        ),
      );
    const averageLongevity =
      average(
        fragrances.map(
          (fragrance) =>
            fragrance.performance
              .longevity,
        ),
      );

    return (
      <EntityShell
        icon={<FlaskConical size={20} />}
        kicker="Note Intelligence"
        title={note.canonicalName}
        subtitle={`${titleCase(
          note.category,
        )} · ${titleCase(
          note.naturality,
        )}`}
      >
        <MetricGrid
          metrics={[
            {
              label:
                "Fragrances",
              value:
                fragrances.length,
            },
            {
              label: "Brands",
              value:
                brands.length,
            },
            {
              label: "Accords",
              value:
                accords.length,
            },
            {
              label:
                "Avg. longevity",
              value:
                averageLongevity
                  ? `${averageLongevity}/100`
                  : "—",
            },
          ]}
        />

        <div className="entity-dossier-grid mt-6">
          <DossierSection
            icon={
              <Sparkles
                size={16}
              />
            }
            title="Odor profile"
          >
            <p>
              {note.description ??
                `${note.canonicalName} is currently classified as a ${note.category} note with ${note.naturality} sourcing metadata.`}
            </p>
          </DossierSection>

          <DossierSection
            icon={<Layers3 size={16} />}
            title="Common pairings"
          >
            <TagList
              values={
                accords.map(
                  (item) =>
                    item.canonicalName,
                )
              }
              empty="No accord relationships recorded yet."
            />
          </DossierSection>

          <DossierSection
            icon={<Building2 size={16} />}
            title="Leading brands"
          >
            <TagList
              values={brands.slice(
                0,
                8,
              )}
              empty="No brand usage recorded yet."
            />
          </DossierSection>

          <DossierSection
            icon={<Dna size={16} />}
            title="Representative fragrances"
          >
            <EntityLinks
              values={fragrances
                .slice(0, 8)
                .map(
                  (fragrance) => ({
                    label:
                      fragrance.name,
                    subtitle:
                      fragrance.brand,
                    href:
                      `/explorer?fragrance=${encodeURIComponent(
                        fragrance.id,
                      )}`,
                  }),
                )}
            />
          </DossierSection>
        </div>
      </EntityShell>
    );
  }

  if (accord) {
    const fragrances =
      database.fragrances.filter(
        (fragrance) =>
          fragrance.accordIds.includes(
            accord.id,
          ),
      );
    const notes =
      database.notes.filter(
        (item) =>
          accord.relatedNoteIds.includes(
            item.id,
          ),
      );
    const families =
      unique(
        fragrances.map(
          (fragrance) =>
            fragrance.family,
        ),
      );
    const averageProjection =
      average(
        fragrances.map(
          (fragrance) =>
            fragrance.performance
              .projection,
        ),
      );

    return (
      <EntityShell
        icon={<Layers3 size={20} />}
        kicker="Accord Intelligence"
        title={accord.canonicalName}
        subtitle="Olfactive structure"
      >
        <MetricGrid
          metrics={[
            {
              label:
                "Fragrances",
              value:
                fragrances.length,
            },
            {
              label:
                "Related notes",
              value:
                notes.length,
            },
            {
              label:
                "Families",
              value:
                families.length,
            },
            {
              label:
                "Avg. projection",
              value:
                averageProjection
                  ? `${averageProjection}/100`
                  : "—",
            },
          ]}
        />

        <div className="entity-dossier-grid mt-6">
          <DossierSection
            icon={<Atom size={16} />}
            title="Definition"
          >
            <p>
              {accord.description ??
                `${accord.canonicalName} is a composite olfactive impression built from multiple notes and materials.`}
            </p>
          </DossierSection>

          <DossierSection
            icon={
              <FlaskConical
                size={16}
              />
            }
            title="Dominant notes"
          >
            <TagList
              values={notes.map(
                (item) =>
                  item.canonicalName,
              )}
              empty="No related notes recorded yet."
            />
          </DossierSection>

          <DossierSection
            icon={<GitBranch size={16} />}
            title="Related families"
          >
            <TagList
              values={families}
              empty="No family relationships recorded yet."
            />
          </DossierSection>

          <DossierSection
            icon={<Dna size={16} />}
            title="Representative fragrances"
          >
            <EntityLinks
              values={fragrances
                .slice(0, 8)
                .map(
                  (fragrance) => ({
                    label:
                      fragrance.name,
                    subtitle:
                      fragrance.brand,
                    href:
                      `/explorer?fragrance=${encodeURIComponent(
                        fragrance.id,
                      )}`,
                  }),
                )}
            />
          </DossierSection>
        </div>
      </EntityShell>
    );
  }

  if (!ingredient) {
    return null;
  }

  return (
    <EntityShell
      icon={<Atom size={20} />}
      kicker="Ingredient Intelligence"
      title={ingredient.canonicalName}
      subtitle={`${titleCase(
        ingredient.category,
      )} · ${titleCase(
        ingredient.volatility,
      )}`}
    >
      <MetricGrid
        metrics={[
          {
            label:
              "Odor facets",
            value:
              ingredient
                .odorProfile
                .length,
          },
          {
            label:
              "Origins",
            value:
              ingredient
                .originCountryCodes
                .length,
          },
          {
            label:
              "Methods",
            value:
              ingredient
                .extractionMethods
                .length,
          },
          {
            label:
              "Confidence",
            value:
              `${ingredient.confidence}%`,
          },
        ]}
      />

      <div className="entity-dossier-grid mt-6">
        <DossierSection
          icon={
            <Sparkles size={16} />
          }
          title="Odor character"
        >
          <TagList
            values={
              ingredient.odorProfile
            }
            empty="No odor facets recorded yet."
          />
        </DossierSection>

        <DossierSection
          icon={
            <Building2 size={16} />
          }
          title="Origins"
        >
          <TagList
            values={
              ingredient
                .originCountryCodes
            }
            empty="Origin metadata is not yet available."
          />
        </DossierSection>

        <DossierSection
          icon={
            <TrendingUp size={16} />
          }
          title="Production"
        >
          <TagList
            values={
              ingredient
                .extractionMethods
            }
            empty="Production metadata is not yet available."
          />
        </DossierSection>

        <DossierSection
          icon={<Dna size={16} />}
          title="Related notes"
        >
          <TagList
            values={
              ingredient.relatedNoteIds
                .map(
                  (id) =>
                    database.notes.find(
                      (note) =>
                        note.id === id,
                    )
                      ?.canonicalName,
                )
                .filter(
                  (
                    value,
                  ): value is string =>
                    Boolean(value),
                )
            }
            empty="No related note entities recorded yet."
          />
        </DossierSection>
      </div>
    </EntityShell>
  );
}

function EntityShell({
  icon,
  kicker,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="entity-dossier">
      <div className="entity-dossier-heading">
        <span className="entity-dossier-icon">
          {icon}
        </span>
        <div>
          <p className="entity-dossier-kicker">
            {kicker}
          </p>
          <h2 className="display-serif">
            {title}
          </h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricGrid({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value:
      | string
      | number;
  }>;
}) {
  return (
    <div className="entity-dossier-metrics">
      {metrics.map(
        (metric) => (
          <div key={metric.label}>
            <small>
              {metric.label}
            </small>
            <strong>
              {metric.value}
            </strong>
          </div>
        ),
      )}
    </div>
  );
}

function DossierSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="entity-dossier-section">
      <div>
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function TagList({
  values,
  empty,
}: {
  values: string[];
  empty: string;
}) {
  if (!values.length) {
    return <p>{empty}</p>;
  }

  return (
    <div className="entity-dossier-tags">
      {values.map(
        (value) => (
          <span key={value}>
            {value}
          </span>
        ),
      )}
    </div>
  );
}

function EntityLinks({
  values,
}: {
  values: Array<{
    label: string;
    subtitle: string;
    href: string;
  }>;
}) {
  if (!values.length) {
    return (
      <p>
        No representative fragrances are currently linked.
      </p>
    );
  }

  return (
    <div className="entity-dossier-links">
      {values.map(
        (value) => (
          <Link
            key={value.href}
            href={value.href}
          >
            <span>
              <strong>
                {value.label}
              </strong>
              <small>
                {value.subtitle}
              </small>
            </span>
            <CalendarDays
              size={14}
            />
          </Link>
        ),
      )}
    </div>
  );
}

function unique(
  values: string[],
) {
  return [...new Set(values)];
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

function titleCase(
  value: string,
) {
  return value
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

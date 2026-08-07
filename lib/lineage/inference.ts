import {
  createCanonicalSlug,
} from "@/lib/database/normalization";
import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import type {
  FragranceLineDefinition,
  LineageMetadata,
} from "@/lib/lineage/types";
import {
  createLineageRegistry,
  type LineageRegistry,
} from "@/lib/lineage/registry";

const concentrationTokens = [
  "eau de toilette",
  "eau de parfum",
  "extrait de parfum",
  "parfum",
  "elixir",
  "intense",
  "absolu",
  "absolue",
  "cologne",
];

export function inferLineageRegistry(
  database: GlobalFragranceDatabase,
): LineageRegistry {
  const grouped =
    new Map<
      string,
      GlobalFragranceRecord[]
    >();

  for (const fragrance of database.fragrances) {
    const key = `${fragrance.brandId}:${normalizeLineName(fragrance)}`;
    const group =
      grouped.get(key) ?? [];
    group.push(fragrance);
    grouped.set(key, group);
  }

  const lines:
    FragranceLineDefinition[] = [];
  const metadata:
    LineageMetadata[] = [];

  for (const [
    key,
    members,
  ] of grouped) {
    if (members.length < 2) {
      continue;
    }

    const ordered =
      [...members].sort(
        compareChronology,
      );
    const original =
      ordered[0];
    const lineId =
      `line-${createCanonicalSlug(
        original.brand,
        normalizeLineName(
          original,
        ),
      )}`;

    lines.push({
      id: lineId,
      canonicalName:
        normalizeLineName(
          original,
        ),
      brandId:
        original.brandId,
      originalFragranceId:
        original.id,
      memberIds:
        ordered.map(
          (member) =>
            member.id,
        ),
      confidence: 55,
      source: "inferred",
    });

    ordered.forEach(
      (
        member,
        index,
      ) => {
        metadata.push({
          fragranceId:
            member.id,
          lineId,
          parentId:
            index === 0
              ? undefined
              : original.id,
          generation:
            index === 0
              ? 0
              : 1,
          releaseOrder:
            index + 1,
          relationship:
            index === 0
              ? "original"
              : "flanker",
          status:
            member.availability ===
            "discontinued"
              ? "discontinued"
              : member.availability ===
                  "limited"
                ? "limited"
                : "active",
          concentrationId:
            member.concentrationId,
          predecessorId:
            index > 0
              ? ordered[
                  index - 1
                ].id
              : undefined,
          successorId:
            index <
            ordered.length - 1
              ? ordered[
                  index + 1
                ].id
              : undefined,
          confidence: 55,
          source: "inferred",
        });
      },
    );
  }

  return createLineageRegistry({
    lines,
    metadata,
  });
}

export function normalizeLineName(
  fragrance: Pick<
    GlobalFragranceRecord,
    "name" | "concentration"
  >,
) {
  let value =
    fragrance.name
      .toLowerCase();

  for (const token of concentrationTokens) {
    value = value.replace(
      new RegExp(
        `\\b${escapeRegex(
          token,
        )}\\b`,
        "gi",
      ),
      " ",
    );
  }

  const concentration =
    fragrance.concentration
      .toLowerCase();

  value = value.replace(
    new RegExp(
      `\\b${escapeRegex(
        concentration,
      )}\\b`,
      "gi",
    ),
    " ",
  );

  return value
    .replace(
      /\b(edp|edt|edc)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function compareChronology(
  first: GlobalFragranceRecord,
  second: GlobalFragranceRecord,
) {
  return (
    (first.releaseYear ??
      Number.MAX_SAFE_INTEGER) -
      (second.releaseYear ??
        Number.MAX_SAFE_INTEGER) ||
    concentrationRank(
      first.concentrationId,
    ) -
      concentrationRank(
        second.concentrationId,
      ) ||
    first.name.localeCompare(
      second.name,
    )
  );
}

function concentrationRank(
  concentrationId: string,
) {
  const ranks: Record<
    string,
    number
  > = {
    "eau-de-cologne": 1,
    "eau-de-toilette": 2,
    "eau-de-parfum": 3,
    parfum: 4,
    "extrait-de-parfum": 5,
    elixir: 6,
  };

  return (
    ranks[concentrationId] ??
    50
  );
}

function escapeRegex(
  value: string,
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

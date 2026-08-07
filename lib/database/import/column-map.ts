import type {
  ImportColumnMap,
} from "@/lib/database/import/types";
import {
  normalizeHeader,
} from "@/lib/database/import/normalization";

export const defaultImportColumnMap:
  ImportColumnMap = {
    id: [
      "id",
      "fragranceid",
      "recordid",
      "slug",
    ],
    name: [
      "name",
      "fragrance",
      "fragrancename",
      "perfume",
      "perfumename",
    ],
    brand: [
      "brand",
      "house",
      "fragrancehouse",
      "manufacturer",
    ],
    concentration: [
      "concentration",
      "strength",
      "format",
      "type",
    ],
    releaseYear: [
      "releaseyear",
      "year",
      "launched",
      "launchyear",
    ],
    family: [
      "family",
      "fragrancefamily",
      "olfactivefamily",
      "olfactoryfamily",
    ],
    perfumers: [
      "perfumers",
      "perfumer",
      "nose",
      "noses",
      "creator",
      "creators",
    ],
    topNotes: [
      "topnotes",
      "top",
      "openingnotes",
    ],
    heartNotes: [
      "heartnotes",
      "middlenotes",
      "heart",
      "middle",
    ],
    baseNotes: [
      "basenotes",
      "base",
      "drydownnotes",
    ],
    accords: [
      "accords",
      "mainaccords",
    ],
    roles: [
      "roles",
      "occasions",
      "uses",
    ],
    moods: [
      "moods",
      "style",
      "styles",
    ],
    longevity: [
      "longevity",
      "longevityscore",
    ],
    projection: [
      "projection",
      "projectionscore",
    ],
    sillage: [
      "sillage",
      "sillagescore",
    ],
    availability: [
      "availability",
      "status",
    ],
    aliases: [
      "aliases",
      "alternatenames",
      "aka",
    ],
    sourceUrl: [
      "sourceurl",
      "url",
      "referenceurl",
    ],
  };

export function createHeaderLookup(
  headers: string[],
  columnMap:
    ImportColumnMap =
      defaultImportColumnMap,
) {
  const normalizedHeaders =
    new Map(
      headers.map((header) => [
        normalizeHeader(header),
        header,
      ]),
    );

  return Object.fromEntries(
    (
      Object.entries(
        columnMap,
      ) as Array<
        [
          keyof ImportColumnMap,
          string[],
        ]
      >
    ).map(
      ([field, aliases]) => [
        field,
        aliases
          .map((alias) =>
            normalizedHeaders.get(
              normalizeHeader(alias),
            ),
          )
          .find(Boolean),
      ],
    ),
  ) as Record<
    keyof ImportColumnMap,
    string | undefined
  >;
}

import type {
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import type {
  NormalizedFragranceImport,
} from "@/lib/database/import/types";

const seasons:
  Season[] = [
    "spring",
    "summer",
    "fall",
    "winter",
  ];

export function adaptImportedFragrance(
  imported:
    NormalizedFragranceImport,
): FragranceRecord {
  const roles =
    imported.roles
      .map(
        normalizeRole,
      )
      .filter(
        (
          role,
        ): role is FragranceRole =>
          Boolean(role),
      );

  return {
    id: imported.id,
    name: imported.name,
    brand: imported.brand,
    concentration:
      imported.concentration,
    releaseYear:
      imported.releaseYear,
    family:
      imported.family,
    perfumers:
      imported.perfumers,
    notes: {
      top:
        imported.topNotes,
      heart:
        imported.heartNotes,
      base:
        imported.baseNotes,
    },
    accords:
      imported.accords,
    roles:
      roles.length
        ? roles
        : ["casual"],
    seasons:
      Object.fromEntries(
        seasons.map(
          (season) => [
            season,
            50,
          ],
        ),
      ) as Record<
        Season,
        number
      >,
    dna: {
      fresh: 50,
      green: 50,
      woody: 50,
      amber: 50,
      sweet: 50,
      dark: 50,
      artistic: 50,
      formal: 50,
    },
    moods:
      imported.moods,
    performance: {
      longevity:
        imported.longevity ??
        50,
      projection:
        imported.projection ??
        50,
      sillage:
        imported.sillage,
    },
    intelligenceStatus:
      "calibration",
  };
}

function normalizeRole(
  value: string,
):
  | FragranceRole
  | null {
  const normalized =
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      );

  const aliases:
    Record<
      string,
      FragranceRole
    > = {
      daily: "casual",
      everyday: "casual",
      casual: "casual",
      office: "office",
      work: "office",
      date: "date",
      "date-night":
        "date",
      formal: "formal",
      summer: "summer",
      winter: "winter",
      signature:
        "signature",
      artistic: "creative",
      creative: "creative",
      versatile:
        "casual",
      travel: "travel",
    };

  return (
    aliases[normalized] ??
    null
  );
}

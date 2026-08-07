import type {
  AccordEntity,
  BrandEntity,
  ConcentrationEntity,
  CountryEntity,
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
  NoteEntity,
  PerfumerEntity,
} from "@/lib/database/schema";
import {
  createCanonicalSlug,
  createEntityId,
  normalizeConcentration,
  normalizeEntityName,
} from "@/lib/database/normalization";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

const countries: CountryEntity[] = [
  {
    code: "FR",
    canonicalName: "France",
    region: "Europe",
  },
  {
    code: "IT",
    canonicalName: "Italy",
    region: "Europe",
  },
  {
    code: "GB",
    canonicalName:
      "United Kingdom",
    region: "Europe",
  },
  {
    code: "US",
    canonicalName:
      "United States",
    region: "North America",
  },
  {
    code: "AE",
    canonicalName:
      "United Arab Emirates",
    region: "Middle East",
  },
  {
    code: "OM",
    canonicalName: "Oman",
    region: "Middle East",
  },
];

const concentrations:
  ConcentrationEntity[] = [
    {
      id: "eau-de-cologne",
      canonicalName:
        "Eau de Cologne",
      aliases: ["Cologne", "EDC"],
      approximateOilRange: {
        minimum: 2,
        maximum: 5,
      },
    },
    {
      id: "eau-de-toilette",
      canonicalName:
        "Eau de Toilette",
      aliases: ["EDT"],
      approximateOilRange: {
        minimum: 5,
        maximum: 15,
      },
    },
    {
      id: "eau-de-parfum",
      canonicalName:
        "Eau de Parfum",
      aliases: ["EDP"],
      approximateOilRange: {
        minimum: 15,
        maximum: 20,
      },
    },
    {
      id: "parfum",
      canonicalName: "Parfum",
      aliases: ["Pure Parfum"],
      approximateOilRange: {
        minimum: 20,
        maximum: 30,
      },
    },
    {
      id: "extrait-de-parfum",
      canonicalName:
        "Extrait de Parfum",
      aliases: ["Extrait"],
      approximateOilRange: {
        minimum: 25,
        maximum: 40,
      },
    },
  ];

export function buildGlobalFragranceDatabase({
  catalog,
}: {
  catalog: FragranceRecord[];
}): GlobalFragranceDatabase {
  const brands =
    buildBrands(catalog);
  const perfumers =
    buildPerfumers(catalog);
  const notes =
    buildNotes(catalog);
  const accords =
    buildAccords(catalog);

  const fragrances =
    catalog.map((fragrance) =>
      enrichFragrance({
        fragrance,
        brands,
        perfumers,
        notes,
        accords,
      }),
    );

  return {
    schemaVersion: "GFD-1.0.0",
    generatedAt:
      new Date().toISOString(),
    brands,
    perfumers,
    notes,
    accords,
    countries,
    concentrations,
    assets: [],
    fragrances,
  };
}

function buildBrands(
  catalog: FragranceRecord[],
): BrandEntity[] {
  return [
    ...new Set(
      catalog.map(
        (fragrance) =>
          normalizeEntityName(
            fragrance.brand,
          ),
      ),
    ),
  ]
    .map((brand) => ({
      id: createEntityId(
        "brand",
        brand,
      ),
      canonicalName: brand,
      aliases: [],
      status: "review" as const,
      confidence: 80,
      sources: [],
    }))
    .sort((a, b) =>
      a.canonicalName.localeCompare(
        b.canonicalName,
      ),
    );
}

function buildPerfumers(
  catalog: FragranceRecord[],
): PerfumerEntity[] {
  return [
    ...new Set(
      catalog.flatMap(
        (fragrance) =>
          fragrance.perfumers ?? [],
      ),
    ),
  ]
    .map((perfumer) => ({
      id: createEntityId(
        "perfumer",
        perfumer,
      ),
      canonicalName:
        normalizeEntityName(perfumer),
      aliases: [],
      status: "review" as const,
      confidence: 70,
      sources: [],
    }))
    .sort((a, b) =>
      a.canonicalName.localeCompare(
        b.canonicalName,
      ),
    );
}

function buildNotes(
  catalog: FragranceRecord[],
): NoteEntity[] {
  return [
    ...new Set(
      catalog.flatMap(
        (fragrance) => [
          ...(fragrance.notes?.top ??
            []),
          ...(fragrance.notes?.heart ??
            []),
          ...(fragrance.notes?.base ??
            []),
        ],
      ),
    ),
  ]
    .map((note) => ({
      id: createEntityId(
        "note",
        note,
      ),
      canonicalName:
        normalizeEntityName(note),
      aliases: [],
      category: "other" as const,
      naturality: "unknown" as const,
      confidence: 60,
    }))
    .sort((a, b) =>
      a.canonicalName.localeCompare(
        b.canonicalName,
      ),
    );
}

function buildAccords(
  catalog: FragranceRecord[],
): AccordEntity[] {
  return [
    ...new Set(
      catalog.flatMap(
        (fragrance) =>
          fragrance.accords ?? [],
      ),
    ),
  ]
    .map((accord) => ({
      id: createEntityId(
        "accord",
        accord,
      ),
      canonicalName:
        normalizeEntityName(accord),
      aliases: [],
      relatedNoteIds: [],
      confidence: 65,
    }))
    .sort((a, b) =>
      a.canonicalName.localeCompare(
        b.canonicalName,
      ),
    );
}

function enrichFragrance({
  fragrance,
  brands,
  perfumers,
  notes,
  accords,
}: {
  fragrance: FragranceRecord;
  brands: BrandEntity[];
  perfumers: PerfumerEntity[];
  notes: NoteEntity[];
  accords: AccordEntity[];
}): GlobalFragranceRecord {
  const brand =
    brands.find(
      (candidate) =>
        candidate.canonicalName ===
        normalizeEntityName(
          fragrance.brand,
        ),
    );

  const noteId = (
    value: string,
  ) =>
    notes.find(
      (candidate) =>
        candidate.canonicalName ===
        normalizeEntityName(value),
    )?.id ??
    createEntityId("note", value);

  const accordId = (
    value: string,
  ) =>
    accords.find(
      (candidate) =>
        candidate.canonicalName ===
        normalizeEntityName(value),
    )?.id ??
    createEntityId("accord", value);

  const dataQualityScore =
    calculateDataQuality(
      fragrance,
    );

  return {
    ...fragrance,
    schemaVersion: "GFD-1.0.0",
    canonicalSlug:
      createCanonicalSlug(
        fragrance.brand,
        fragrance.name,
        fragrance.concentration,
      ),
    brandId:
      brand?.id ??
      createEntityId(
        "brand",
        fragrance.brand,
      ),
    perfumerIds:
      (fragrance.perfumers ?? []).map(
        (name) =>
          perfumers.find(
            (candidate) =>
              candidate.canonicalName ===
              normalizeEntityName(name),
          )?.id ??
          createEntityId(
            "perfumer",
            name,
          ),
      ),
    countryCode:
      normalizeCountryCode(
        fragrance.countryOfOrigin,
      ),
    concentrationId:
      normalizeConcentration(
        fragrance.concentration,
      ),
    noteIds: {
      top:
        fragrance.notes?.top.map(
          noteId,
        ) ?? [],
      heart:
        fragrance.notes?.heart.map(
          noteId,
        ) ?? [],
      base:
        fragrance.notes?.base.map(
          noteId,
        ) ?? [],
    },
    accordIds:
      (fragrance.accords ?? []).map(
        accordId,
      ),
    relationships: [],
    ratings: [],
    availability:
      fragrance.market
        ?.availability ??
      "unknown",
    assetIds: [],
    popularityScore: 0,
    dataQualityScore,
    sources: [],
    updatedAt:
      new Date().toISOString(),
  };
}

export function calculateDataQuality(
  fragrance: FragranceRecord,
) {
  const checks = [
    Boolean(fragrance.brand),
    Boolean(fragrance.name),
    Boolean(
      fragrance.concentration,
    ),
    Boolean(fragrance.family),
    Boolean(
      fragrance.roles.length,
    ),
    Boolean(
      Object.keys(
        fragrance.seasons,
      ).length === 4,
    ),
    Boolean(
      Object.keys(
        fragrance.dna,
      ).length === 8,
    ),
    Boolean(
      fragrance.performance
        .longevity,
    ),
    Boolean(
      fragrance.performance
        .projection,
    ),
    Boolean(fragrance.releaseYear),
    Boolean(
      fragrance.perfumers?.length,
    ),
    Boolean(fragrance.accords?.length),
    Boolean(
      fragrance.notes &&
        (fragrance.notes.top.length +
          fragrance.notes.heart
            .length +
          fragrance.notes.base.length >
          0),
    ),
    Boolean(
      fragrance.countryOfOrigin,
    ),
    Boolean(fragrance.market),
  ];

  return Math.round(
    (checks.filter(Boolean).length /
      checks.length) *
      100,
  );
}

function normalizeCountryCode(
  value?: string,
) {
  if (!value) return undefined;

  return countries.find(
    (country) =>
      country.canonicalName
        .toLowerCase() ===
      normalizeEntityName(value)
        .toLowerCase(),
  )?.code;
}

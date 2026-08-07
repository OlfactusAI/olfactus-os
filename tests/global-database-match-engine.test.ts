import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";
import {
  analyzeImportMatches,
  parseImportPayload,
} from "@/lib/database/import";

const catalog:
  FragranceRecord[] = [
    {
      id: "bleu-edp",
      brand: "Chanel",
      name:
        "Bleu de Chanel Eau de Parfum",
      concentration:
        "Eau de Parfum",
      releaseYear: 2014,
      family:
        "Woody Aromatic",
      perfumers: [
        "Jacques Polge",
      ],
      notes: {
        top: [
          "Grapefruit",
          "Lemon",
        ],
        heart: [
          "Ginger",
          "Incense",
        ],
        base: [
          "Sandalwood",
          "Cedar",
        ],
      },
      accords: [
        "Woody",
        "Citrus",
      ],
      roles: [
        "office",
        "formal",
      ],
      seasons: {
        spring: 85,
        summer: 75,
        fall: 90,
        winter: 80,
      },
      dna: {
        fresh: 75,
        green: 38,
        woody: 82,
        amber: 48,
        sweet: 28,
        dark: 34,
        artistic: 70,
        formal: 85,
      },
      moods: [
        "refined",
      ],
      performance: {
        longevity: 82,
        projection: 76,
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "bleu-parfum",
      brand: "Chanel",
      name:
        "Bleu de Chanel Parfum",
      concentration: "Parfum",
      releaseYear: 2018,
      family:
        "Woody Aromatic",
      perfumers: [
        "Olivier Polge",
      ],
      notes: {
        top: ["Lemon"],
        heart: ["Lavender"],
        base: [
          "Sandalwood",
          "Cedar",
        ],
      },
      accords: [
        "Woody",
        "Aromatic",
      ],
      roles: [
        "formal",
        "date",
      ],
      seasons: {
        spring: 75,
        summer: 58,
        fall: 92,
        winter: 88,
      },
      dna: {
        fresh: 58,
        green: 28,
        woody: 90,
        amber: 58,
        sweet: 32,
        dark: 48,
        artistic: 78,
        formal: 94,
      },
      moods: [
        "elegant",
      ],
      performance: {
        longevity: 88,
        projection: 72,
      },
      intelligenceStatus:
        "validated",
    },
  ];

const existing =
  buildGlobalFragranceDatabase({
    catalog,
  }).fragrances;

describe("Global Database Match Engine", () => {
  it("detects exact duplicates", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            id: "bleu-edp",
            name:
              "Bleu de Chanel Eau de Parfum",
            brand: "Chanel",
            concentration:
              "Eau de Parfum",
            releaseYear: 2014,
            family:
              "Woody Aromatic",
            perfumers:
              "Jacques Polge",
            topNotes:
              "Grapefruit; Lemon",
            heartNotes:
              "Ginger; Incense",
            baseNotes:
              "Sandalwood; Cedar",
            accords:
              "Woody; Citrus",
          },
        ]),
      });

    const result =
      analyzeImportMatches({
        incoming:
          parsed.records,
        existing,
      });

    expect(
      result.matches[0]
        .classification,
    ).toBe(
      "exact-duplicate",
    );
    expect(
      result.matches[0]
        .recommendedAction,
    ).toBe("skip");
  });

  it("detects probable duplicates with alternate naming", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Bleu de Chanel EDP",
            brand: "Chanel",
            concentration: "EDP",
            releaseYear: 2014,
            perfumers:
              "Jacques Polge",
            accords:
              "Woody; Citrus",
          },
        ]),
      });

    const match =
      analyzeImportMatches({
        incoming:
          parsed.records,
        existing,
      }).matches[0];

    expect(
      [
        "probable-duplicate",
        "safe-update",
      ],
    ).toContain(
      match.classification,
    );
    expect(
      match.matchedFragranceId,
    ).toBe("bleu-edp");
  });

  it("detects possible concentration variants", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Bleu de Chanel",
            brand: "Chanel",
            concentration:
              "Eau de Toilette",
            releaseYear: 2010,
          },
        ]),
      });

    const match =
      analyzeImportMatches({
        incoming:
          parsed.records,
        existing,
      }).matches[0];

    expect(
      [
        "possible-variant",
        "manual-review",
      ],
    ).toContain(
      match.classification,
    );
  });

  it("reports field-level conflicts", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            id: "bleu-edp",
            name:
              "Bleu de Chanel Eau de Parfum",
            brand: "Chanel",
            concentration:
              "Eau de Parfum",
            releaseYear: 2015,
            family:
              "Amber Woody",
          },
        ]),
      });

    const match =
      analyzeImportMatches({
        incoming:
          parsed.records,
        existing,
      }).matches[0];

    expect(
      match.conflicts.some(
        (conflict) =>
          conflict.field ===
            "releaseYear" &&
          conflict.status ===
            "conflict",
      ),
    ).toBe(true);

    expect(
      match.classification,
    ).toBe(
      "conflicting-update",
    );
  });

  it("classifies unrelated records as new", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Solaris One",
            brand:
              "Independent House",
            concentration:
              "Extrait de Parfum",
            releaseYear: 2026,
            family:
              "Floral Amber",
          },
        ]),
      });

    const match =
      analyzeImportMatches({
        incoming:
          parsed.records,
        existing,
      }).matches[0];

    expect(
      match.classification,
    ).toBe("new");
    expect(
      match.recommendedAction,
    ).toBe("create");
  });
});

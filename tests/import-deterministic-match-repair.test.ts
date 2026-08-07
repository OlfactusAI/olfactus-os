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

const base: FragranceRecord = {
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
  roles: ["office"],
  seasons: {
    spring: 80,
    summer: 75,
    fall: 85,
    winter: 75,
  },
  dna: {
    fresh: 75,
    green: 35,
    woody: 82,
    amber: 48,
    sweet: 25,
    dark: 32,
    artistic: 70,
    formal: 85,
  },
  moods: ["refined"],
  performance: {
    longevity: 82,
    projection: 76,
  },
  intelligenceStatus:
    "validated",
};

describe("Deterministic match repair", () => {
  const existing =
    buildGlobalFragranceDatabase({
      catalog: [base],
    }).fragrances;

  it("matches EDP aliases despite omitted family and note fields", () => {
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

    expect([
      "probable-duplicate",
      "safe-update",
    ]).toContain(
      match.classification,
    );
  });

  it("treats an explicit ID with a changed year as a conflict", () => {
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
            releaseYear: 2024,
            family:
              "Woody Aromatic",
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
    ).toBe(
      "conflicting-update",
    );
  });
});

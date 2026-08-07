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

describe("Alternate-name match regression", () => {
  it("does not treat omitted note fields as identity conflicts", () => {
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
          ],
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
      ];

    const existing =
      buildGlobalFragranceDatabase({
        catalog,
      }).fragrances;

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

  it("still identifies real release-year conflicts", () => {
    const catalog:
      FragranceRecord[] = [
        {
          id: "atlas-edp",
          brand: "Example",
          name: "Atlas",
          concentration:
            "Eau de Parfum",
          releaseYear: 2020,
          family: "Woody",
          roles: ["office"],
          seasons: {
            spring: 70,
            summer: 60,
            fall: 80,
            winter: 75,
          },
          dna: {
            fresh: 50,
            green: 40,
            woody: 80,
            amber: 50,
            sweet: 30,
            dark: 40,
            artistic: 60,
            formal: 70,
          },
          moods: [],
          performance: {
            longevity: 75,
            projection: 70,
          },
          intelligenceStatus:
            "validated",
        },
      ];

    const existing =
      buildGlobalFragranceDatabase({
        catalog,
      }).fragrances;

    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            id: "atlas-edp",
            name: "Atlas",
            brand: "Example",
            concentration:
              "Eau de Parfum",
            releaseYear: 2024,
            family: "Woody",
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

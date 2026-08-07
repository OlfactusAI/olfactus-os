import {
  describe,
  expect,
  it,
} from "vitest";

import {
  adaptImportedFragrance,
  normalizeCanonicalId,
  normalizeList,
  normalizeScore,
  parseImportPayload,
} from "@/lib/database/import";

describe("Global Database Import Parser", () => {
  it("parses and normalizes JSON fragrance records", () => {
    const result =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            fragranceName:
              "Bleu de Chanel",
            house: "Chanel",
            concentration:
              "Eau de Parfum",
            releaseYear: "2014",
            perfumer:
              "Jacques Polge",
            topNotes:
              "Lemon; Grapefruit",
            accords:
              "Citrus | Woody",
            longevity: "8.4",
            projection: 78,
          },
        ]),
        options: {
          sourceId:
            "fixture",
          sourceLabel:
            "Fixture",
        },
      });

    expect(
      result.rowsParsed,
    ).toBe(1);
    expect(
      result.rowsRejected,
    ).toBe(0);
    expect(
      result.records[0].id,
    ).toBe(
      "chanel-bleu-de-chanel-eau-de-parfum",
    );
    expect(
      result.records[0]
        .releaseYear,
    ).toBe(2014);
    expect(
      result.records[0]
        .longevity,
    ).toBe(84);
    expect(
      result.records[0]
        .topNotes,
    ).toEqual([
      "Lemon",
      "Grapefruit",
    ]);
  });

  it("parses quoted CSV and alternate column names", () => {
    const input = [
      "Perfume,House,Type,Year,Nose,Main Accords",
      '"Grand Soir","Maison Francis Kurkdjian","Eau de Parfum","2016","Francis Kurkdjian","Amber, Vanilla"',
    ].join("\n");

    const result =
      parseImportPayload({
        format: "csv",
        input,
      });

    expect(
      result.rowsParsed,
    ).toBe(1);
    expect(
      result.records[0].name,
    ).toBe("Grand Soir");
    expect(
      result.records[0].brand,
    ).toBe(
      "Maison Francis Kurkdjian",
    );
    expect(
      result.records[0]
        .accords,
    ).toEqual([
      "Amber",
      "Vanilla",
    ]);
  });

  it("rejects rows without required fields", () => {
    const result =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            brand: "Example",
          },
        ]),
      });

    expect(
      result.rowsParsed,
    ).toBe(0);
    expect(
      result.rowsRejected,
    ).toBe(1);
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
          "missing-required-field",
      ),
    ).toBe(true);
  });

  it("normalizes IDs, lists, and scores consistently", () => {
    expect(
      normalizeCanonicalId(
        "L'Artisan Parfumeur",
        "Un Air de Bretagne",
      ),
    ).toBe(
      "lartisan-parfumeur-un-air-de-bretagne",
    );

    expect(
      normalizeList(
        "Amber; Vanilla | Woods",
      ),
    ).toEqual([
      "Amber",
      "Vanilla",
      "Woods",
    ]);

    expect(
      normalizeScore("7.5"),
    ).toBe(75);
  });

  it("adapts normalized imports to the existing fragrance domain", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name: "Atlas",
            brand: "Example",
            concentration:
              "Parfum",
            family:
              "Woody Amber",
            roles:
              "office; formal",
            moods:
              "refined",
          },
        ]),
      });

    const fragrance =
      adaptImportedFragrance(
        parsed.records[0],
      );

    expect(
      fragrance.intelligenceStatus,
    ).toBe("calibration");
    expect(
      fragrance.roles,
    ).toContain("office");
    expect(
      fragrance.performance
        .longevity,
    ).toBe(50);
  });
});

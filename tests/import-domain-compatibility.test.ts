import {
  describe,
  expect,
  it,
} from "vitest";

import {
  adaptImportedFragrance,
  parseImportPayload,
} from "@/lib/database/import";

describe("Import domain compatibility repair", () => {
  it("maps external roles into the existing OLFACTUS role vocabulary", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name: "Atlas",
            brand: "Example",
            concentration:
              "Eau de Parfum",
            family: "Woody",
            roles:
              "everyday; date-night; artistic; versatile",
          },
        ]),
      });

    const fragrance =
      adaptImportedFragrance(
        parsed.records[0],
      );

    expect(
      fragrance.roles,
    ).toEqual([
      "casual",
      "date",
      "creative",
      "casual",
    ]);
    expect(
      fragrance.intelligenceStatus,
    ).toBe("calibration");
  });

  it("creates database-compatible source references", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name: "Atlas",
            brand: "Example",
            concentration:
              "Eau de Parfum",
            family: "Woody",
          },
        ]),
        options: {
          sourceId:
            "fixture-source",
          sourceLabel:
            "Fixture Source",
          sourceUrl:
            "https://example.test",
        },
      });

    expect(
      parsed.records[0]
        .sourceReferences[0],
    ).toMatchObject({
      id: "fixture-source",
      sourceName:
        "Fixture Source",
      sourceUrl:
        "https://example.test",
      confidence: 70,
    });
  });
});

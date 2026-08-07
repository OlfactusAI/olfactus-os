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
  buildUniversalSearchIndex,
  searchUniversalIndex,
} from "@/lib/search";

const catalog:
  FragranceRecord[] = [
    {
      id: "aventus",
      brand: "Creed",
      name: "Aventus",
      concentration:
        "Eau de Parfum",
      releaseYear: 2010,
      family:
        "Fruity Chypre",
      perfumers: [
        "Jean-Christophe Hérault",
      ],
      notes: {
        top: [
          "Pineapple",
          "Bergamot",
        ],
        heart: ["Birch"],
        base: ["Musk"],
      },
      accords: [
        "Fruity",
        "Woody",
      ],
      roles: ["signature"],
      seasons: {
        spring: 90,
        summer: 82,
        fall: 88,
        winter: 70,
      },
      dna: {
        fresh: 82,
        green: 48,
        woody: 78,
        amber: 35,
        sweet: 42,
        dark: 38,
        artistic: 78,
        formal: 82,
      },
      moods: ["confident"],
      performance: {
        longevity: 84,
        projection: 82,
      },
      intelligenceStatus:
        "validated",
    },
  ];

describe("Universal Entity Dossiers contract", () => {
  const database =
    buildGlobalFragranceDatabase({
      catalog,
    });
  const index =
    buildUniversalSearchIndex({
      catalog,
    });

  it("routes note search results to an exact note dossier", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Pineapple",
        options: {
          entityTypes: ["note"],
        },
      });

    expect(
      result.hits[0]
        .document.route,
    ).toContain(
      "/database?note=",
    );
    expect(
      database.notes.some(
        (note) =>
          result.hits[0]
            .document.route.includes(
              note.id,
            ),
      ),
    ).toBe(true);
  });

  it("routes brands and perfumers to direct dossier parameters", () => {
    const brand =
      searchUniversalIndex({
        index,
        query: "Creed",
        options: {
          entityTypes: ["brand"],
        },
      }).hits[0];

    const perfumer =
      searchUniversalIndex({
        index,
        query:
          "Jean-Christophe Hérault",
        options: {
          entityTypes: [
            "perfumer",
          ],
        },
      }).hits[0];

    expect(
      brand.document.route,
    ).toContain(
      "/brands?brand=",
    );
    expect(
      perfumer.document.route,
    ).toContain(
      "/perfumers?perfumer=",
    );
  });

  it("keeps line routes compatible with exact lineage selection", () => {
    const lineRoute =
      "/lineage?line=aventus-line";

    expect(
      new URL(
        `https://olfactus.local${lineRoute}`,
      ).searchParams.get(
        "line",
      ),
    ).toBe(
      "aventus-line",
    );
  });
});

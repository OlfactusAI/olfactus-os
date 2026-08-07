import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Predictive provider order", () => {
  it("mounts providers in dependency order exactly once", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/layout.tsx",
        ),
        "utf8",
      );

    const providers = [
      "AccountProvider",
      "ActiveCatalogProvider",
      "CollectionProvider",
      "MemoryProvider",
      "PredictiveProvider",
      "IntelligenceEverywhereProvider",
      "OlfactusOSProvider",
      "NavigationProvider",
    ];

    for (const provider of providers) {
      expect(
        source.match(
          new RegExp(
            `<${provider}>`,
            "g",
          ),
        ) ?? [],
      ).toHaveLength(
        1,
      );
      expect(
        source.match(
          new RegExp(
            `</${provider}>`,
            "g",
          ),
        ) ?? [],
      ).toHaveLength(
        1,
      );
    }

    const positions =
      providers.map(
        (provider) =>
          source.indexOf(
            `<${provider}>`,
          ),
      );

    expect(positions).toEqual(
      [...positions].sort(
        (a, b) =>
          a - b,
      ),
    );
  });
});

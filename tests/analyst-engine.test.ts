import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  parseAnalystCommand,
} from "@/lib/analyst/commands";
import {
  runAnalystCommand,
} from "@/lib/analyst/engine";
import {
  buildEntityRegistry,
} from "@/lib/entities/registry";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";
import {
  demoProfile,
} from "@/lib/data/demo";

const analysis =
  analyzeCollectionHealth({
    collection:
      demoCollection,
    profile:
      demoProfile,
    catalog:
      fragrances,
  });
const registry =
  buildEntityRegistry(
    fragrances,
  );

describe("Proactive Analyst engine", () => {
  it("explains Collection Health with evidence", () => {
    const result =
      runAnalystCommand({
        command:
          parseAnalystCommand(
            "/explain collection-health",
          ),
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis,
        registry,
      });

    expect(
      result.response.type,
    ).toBe(
      "health-explanation",
    );
    expect(
      result.response.evidence.length,
    ).toBeGreaterThan(
      0,
    );
  });

  it("recommends only from the owned collection", () => {
    const result =
      runAnalystCommand({
        command:
          parseAnalystCommand(
            "/recommend tonight",
          ),
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis,
        registry,
      });

    expect(
      result.response.type,
    ).toBe(
      "recommendation",
    );

    if (
      result.response.type ===
      "recommendation"
    ) {
      const fragranceId =
        result.response.fragranceId;

      if (
        fragranceId
      ) {
        expect(
          demoCollection.some(
            (item) =>
              item.fragranceId ===
              fragranceId,
          ),
        ).toBe(true);
      }
    }
  });

  it("creates a confirmation preview rather than mutating a wear", () => {
    const owned =
      fragrances.find(
        (fragrance) =>
          demoCollection.some(
            (item) =>
              item.fragranceId ===
              fragrance.id,
          ),
      );

    expect(
      owned,
    ).toBeTruthy();

    const result =
      runAnalystCommand({
        command:
          parseAnalystCommand(
            `/wear ${owned?.name}`,
          ),
        collection:
          demoCollection,
        catalog:
          fragrances,
        analysis,
        registry,
      });

    expect(
      result.preview?.action,
    ).toBe(
      "record-wear",
    );
    expect(
      result.preview?.expectedEffects.length,
    ).toBeGreaterThan(
      2,
    );
  });
});

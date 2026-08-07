import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
  demoProfile,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  simulateCollectionScenario,
} from "@/lib/intelligence/multi-step-simulator";

describe("Multi-step Neural Simulator", () => {
  it("applies an ordered add and remove scenario without mutating the source collection", () => {
    const original =
      demoCollection.map(
        (item) => ({
          ...item,
        }),
      );
    const ownedId =
      original[0]
        ?.fragranceId;
    const candidate =
      fragrances.find(
        (fragrance) =>
          !original.some(
            (item) =>
              item.fragranceId ===
              fragrance.id,
          ),
      );

    expect(ownedId).toBeTruthy();
    expect(candidate).toBeTruthy();

    const result =
      simulateCollectionScenario({
        steps: [
          {
            id: "add",
            action: "add",
            candidateId:
              candidate!.id,
          },
          {
            id: "remove",
            action: "remove",
            candidateId:
              ownedId!,
          },
        ],
        collection:
          original,
        catalog:
          fragrances,
        profile:
          demoProfile,
      });

    expect(
      result.projectedCollection.some(
        (item) =>
          item.fragranceId ===
          candidate!.id,
      ),
    ).toBe(true);
    expect(
      result.projectedCollection.some(
        (item) =>
          item.fragranceId ===
          ownedId,
      ),
    ).toBe(false);
    expect(
      demoCollection,
    ).toEqual(original);
  });
});

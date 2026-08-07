import {
  describe,
  expect,
  it,
} from "vitest";
import {
  aventusReferenceResearchPack,
} from "@/lib/gold-standard-builder/research-packs";

describe("Aventus research source disagreements", () => {
  it("retains note-list and perfumer-attribution disagreements instead of silently reconciling them", () => {
    const ids =
      new Set(
        aventusReferenceResearchPack.facts.map(
          (fact) =>
            fact.factId,
        ),
      );

    expect(
      ids.has(
        "note-list-disagreement",
      ),
    ).toBe(true);

    expect(
      ids.has(
        "perfumer-attribution",
      ),
    ).toBe(true);
  });
});

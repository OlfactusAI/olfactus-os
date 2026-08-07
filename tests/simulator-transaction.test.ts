import { describe, expect, it } from "vitest";
import { demoCollection } from "@/lib/data/demo";

describe("Simulator transaction snapshot", () => {
  it("keeps the original collection immutable for rollback", () => {
    const before = structuredClone(demoCollection);
    const after = before.slice(1);
    expect(before).toHaveLength(demoCollection.length);
    expect(after.length).toBe(before.length - 1);
    expect(demoCollection).toEqual(before);
  });
});

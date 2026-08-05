import { describe, expect, it } from "vitest";
import { collectionReducer } from "@/lib/collection/store";
import { demoCollection } from "@/lib/data/demo";

describe("collectionReducer", () => {
  it("adds a fragrance once", () => {
    const first = collectionReducer({ items: demoCollection }, { type: "add", fragranceId: "un-air" });
    const second = collectionReducer(first, { type: "add", fragranceId: "un-air" });
    expect(first.items).toHaveLength(demoCollection.length + 1);
    expect(second.items).toHaveLength(first.items.length);
  });

  it("logs a wear and resets recency", () => {
    const before = demoCollection.find((item) => item.fragranceId === "ganymede")!;
    const result = collectionReducer({ items: demoCollection }, { type: "log-wear", fragranceId: "ganymede" });
    const after = result.items.find((item) => item.fragranceId === "ganymede")!;
    expect(after.wearCount).toBe(before.wearCount + 1);
    expect(after.daysSinceLastWear).toBe(0);
  });

  it("removes only the selected fragrance", () => {
    const result = collectionReducer({ items: demoCollection }, { type: "remove", fragranceId: "grand-soir" });
    expect(result.items.some((item) => item.fragranceId === "grand-soir")).toBe(false);
    expect(result.items).toHaveLength(demoCollection.length - 1);
  });

  it("toggles favorites without changing ownership", () => {
    const result = collectionReducer({ items: demoCollection }, { type: "toggle-favorite", fragranceId: "imagination" });
    expect(result.items.find((item) => item.fragranceId === "imagination")?.favorite).toBe(true);
    expect(result.items).toHaveLength(demoCollection.length);
  });
});

import {
  describe,
  expect,
  it,
} from "vitest";
import {
  activateCatalogV2Record,
} from "@/lib/catalog-v2/activation/bridge";
import {
  createPlatformEventBus,
} from "@/lib/platform/event-bus";

describe("Catalog activation events", () => {
  it("publishes activation level through the Shared Event Bus", () => {
    const bus =
      createPlatformEventBus();

    activateCatalogV2Record({
      eventBus: bus,
      staged: {
        stagingId: "s",
        stagedAt:
          "2026-08-07T00:00:00.000Z",
        status: "approved",
        issues: [],
        conflicts: [],
        record: {
          canonicalId:
            "brand:scent",
          brand: "Brand",
          name: "Scent",
          aliases: [],
          releaseYear: 2025,
          concentration:
            "EDP",
          family: "Woody",
          perfumers: [],
          notes: ["Cedar"],
          accords: ["Woody"],
          collections: [],
          validationStatus:
            "validated",
          provenance: [
            {
              sourceId: "source",
              sourceKind:
                "curated",
              sourceName:
                "Source",
              importedAt:
                "2026-08-07T00:00:00.000Z",
              confidence: 95,
            },
          ],
          fieldConfidence: {},
        },
      },
    });

    const event =
      bus.history().find(
        (item) =>
          item.type ===
          "catalog.record.activated",
      );

    expect(event).toBeTruthy();
    expect(
      event?.payload,
    ).toMatchObject({
      canonicalId:
        "brand:scent",
      activationLevel:
        "discovery",
    });
  });
});

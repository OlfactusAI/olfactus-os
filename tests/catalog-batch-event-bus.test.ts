import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createJsonCatalogAdapter,
} from "@/lib/catalog-v2/adapters/json-adapter";
import {
  runCatalogBatch,
} from "@/lib/catalog-v2/batch-engine";
import {
  createPlatformEventBus,
} from "@/lib/platform/event-bus";

describe("Catalog V2 platform events", () => {
  it("publishes staged, activation, completed, and rollback events under one correlation id", async () => {
    const bus =
      createPlatformEventBus();

    const adapter =
      createJsonCatalogAdapter({
        id:
          "event-test",
        name:
          "Event Test",
        provenance: {
          sourceKind:
            "curated",
          confidence: 95,
        },
      });

    const batch =
      await runCatalogBatch({
        adapter,
        input:
          JSON.stringify([
            {
              brand:
                "House",
              name:
                "Scent",
              releaseYear:
                2024,
              concentration:
                "Eau de Parfum",
              family:
                "Woody",
              perfumers:
                ["Perfumer"],
              notes:
                ["Cedar"],
              accords:
                ["Woody"],
            },
          ]),
        eventBus:
          bus,
      });

    const beforeRollback =
      bus.history();

    expect(
      beforeRollback.some(
        (event) =>
          event.type ===
          "catalog.record.staged",
      ),
    ).toBe(true);
    expect(
      beforeRollback.some(
        (event) =>
          event.type ===
          "catalog.record.activation-evaluated",
      ),
    ).toBe(true);
    expect(
      beforeRollback.at(-1)
        ?.type,
    ).toBe(
      "catalog.batch.completed",
    );
    expect(
      beforeRollback.every(
        (event) =>
          event.correlationId ===
          batch.batchId,
      ),
    ).toBe(true);

    batch.rollback();

    expect(
      bus.history().at(-1)
        ?.type,
    ).toBe(
      "catalog.batch.rolled-back",
    );
  });
});

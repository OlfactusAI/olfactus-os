import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createPlatformEventBus,
} from "@/lib/platform/event-bus";

describe("Shared Event Bus", () => {
  it("publishes typed events to specific and global subscribers in order", () => {
    const bus =
      createPlatformEventBus({
        clock: () =>
          new Date(
            "2026-08-07T20:00:00.000Z",
          ),
      });

    const received:
      string[] = [];

    bus.subscribe(
      "collector.wear.logged",
      (event) => {
        received.push(
          `wear:${event.payload.fragranceId}`,
        );
      },
    );

    bus.subscribeAll(
      (event) => {
        received.push(
          `all:${event.type}`,
        );
      },
    );

    const event =
      bus.publish(
        "collector.wear.logged",
        {
          fragranceId:
            "fragrance-1",
        },
        {
          source:
            "test",
          correlationId:
            "corr-1",
        },
      );

    expect(
      event.id,
    ).toBe(
      "collector.wear.logged:1",
    );
    expect(
      event.occurredAt,
    ).toBe(
      "2026-08-07T20:00:00.000Z",
    );
    expect(
      event.correlationId,
    ).toBe(
      "corr-1",
    );
    expect(
      received,
    ).toEqual([
      "wear:fragrance-1",
      "all:collector.wear.logged",
    ]);
  });

  it("supports once subscriptions, unsubscribe, bounded history, and subscriber error isolation", () => {
    const errors:
      unknown[] = [];
    const bus =
      createPlatformEventBus({
        historyLimit: 2,
        onSubscriberError:
          (error) => {
            errors.push(
              error,
            );
          },
      });

    let once = 0;
    let regular = 0;

    bus.subscribeOnce(
      "prediction.updated",
      () => {
        once += 1;
      },
    );

    const unsubscribe =
      bus.subscribe(
        "prediction.updated",
        () => {
          regular += 1;
        },
      );

    bus.subscribe(
      "prediction.updated",
      () => {
        throw new Error(
          "isolated",
        );
      },
    );

    bus.publish(
      "prediction.updated",
      {
        scope:
          "collection",
      },
    );
    unsubscribe();
    bus.publish(
      "prediction.updated",
      {
        scope:
          "bottle",
      },
    );
    bus.publish(
      "graph.updated",
      {
        scope:
          "personal",
      },
    );

    expect(once).toBe(1);
    expect(regular).toBe(1);
    expect(errors).toHaveLength(2);
    expect(
      bus.history(),
    ).toHaveLength(2);
    expect(
      bus.history()[0]
        .type,
    ).toBe(
      "prediction.updated",
    );
  });

  it("queues nested publishes so current subscribers finish before the nested event dispatches", () => {
    const bus =
      createPlatformEventBus();
    const order:
      string[] = [];

    bus.subscribe(
      "collector.collection.changed",
      () => {
        order.push(
          "collector:first",
        );
        bus.publish(
          "prediction.updated",
          {
            scope:
              "collection",
          },
        );
      },
    );

    bus.subscribe(
      "collector.collection.changed",
      () => {
        order.push(
          "collector:second",
        );
      },
    );

    bus.subscribe(
      "prediction.updated",
      () => {
        order.push(
          "prediction",
        );
      },
    );

    bus.publish(
      "collector.collection.changed",
      {
        collectionSize: 5,
      },
    );

    expect(order).toEqual([
      "collector:first",
      "collector:second",
      "prediction",
    ]);
  });
});

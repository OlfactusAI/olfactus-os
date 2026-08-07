import type {
  PlatformAnyEventHandler,
  PlatformEvent,
  PlatformEventHandler,
  PlatformEventPayloads,
  PlatformEventType,
  PlatformPublishOptions,
} from "@/lib/platform/events";

export interface PlatformEventBusOptions {
  historyLimit?: number;
  clock?: () => Date;
  idFactory?: (
    type: PlatformEventType,
    sequence: number,
  ) => string;
  onSubscriberError?: (
    error: unknown,
    event: PlatformEvent,
  ) => void;
}

export interface OlfactusEventBus {
  publish<TType extends PlatformEventType>(
    type: TType,
    payload: PlatformEventPayloads[TType],
    options?: PlatformPublishOptions,
  ): PlatformEvent<TType>;

  subscribe<TType extends PlatformEventType>(
    type: TType,
    handler: PlatformEventHandler<TType>,
  ): () => void;

  subscribeOnce<TType extends PlatformEventType>(
    type: TType,
    handler: PlatformEventHandler<TType>,
  ): () => void;

  subscribeAll(
    handler: PlatformAnyEventHandler,
  ): () => void;

  history(): PlatformEvent[];
  history<TType extends PlatformEventType>(
    type: TType,
  ): PlatformEvent<TType>[];

  clearHistory(): void;
  size(): number;
}

interface Subscription {
  id: number;
  type?: PlatformEventType;
  once: boolean;
  handler: PlatformAnyEventHandler;
}

export function createPlatformEventBus(
  options: PlatformEventBusOptions = {},
): OlfactusEventBus {
  const historyLimit =
    Math.max(
      1,
      options.historyLimit ?? 250,
    );
  const clock =
    options.clock ??
    (() => new Date());
  const idFactory =
    options.idFactory ??
    ((type, sequence) =>
      `${type}:${sequence.toString(36)}`);
  const onSubscriberError =
    options.onSubscriberError ??
    (() => undefined);

  let eventSequence = 0;
  let subscriptionSequence = 0;
  let dispatching = false;

  const eventHistory: PlatformEvent[] = [];
  const queue: PlatformEvent[] = [];
  const subscriptions = new Map<
    number,
    Subscription
  >();

  function dispatchQueue() {
    if (dispatching) {
      return;
    }

    dispatching = true;

    try {
      while (queue.length) {
        const event = queue.shift();

        if (!event) {
          continue;
        }

        const current = [
          ...subscriptions.values(),
        ].filter(
          (subscription) =>
            !subscription.type ||
            subscription.type === event.type,
        );

        for (const subscription of current) {
          if (subscription.once) {
            subscriptions.delete(
              subscription.id,
            );
          }

          try {
            subscription.handler(
              event,
            );
          } catch (error) {
            onSubscriberError(
              error,
              event,
            );
          }
        }
      }
    } finally {
      dispatching = false;
    }
  }

  function addSubscription(
    type: PlatformEventType | undefined,
    handler: PlatformAnyEventHandler,
    once: boolean,
  ) {
    subscriptionSequence += 1;
    const id = subscriptionSequence;

    subscriptions.set(
      id,
      {
        id,
        type,
        once,
        handler,
      },
    );

    return () => {
      subscriptions.delete(
        id,
      );
    };
  }

  function readHistory(): PlatformEvent[];
  function readHistory<TType extends PlatformEventType>(
    type: TType,
  ): PlatformEvent<TType>[];
  function readHistory(
    type?: PlatformEventType,
  ) {
    const events = type
      ? eventHistory.filter(
          (event) =>
            event.type === type,
        )
      : eventHistory;

    return [
      ...events,
    ];
  }

  return {
    publish(
      type,
      payload,
      publishOptions = {},
    ) {
      eventSequence += 1;

      const event = {
        id: idFactory(
          type,
          eventSequence,
        ),
        type,
        occurredAt:
          clock().toISOString(),
        source:
          publishOptions.source ??
          "olfactus",
        payload,
        correlationId:
          publishOptions.correlationId,
        causationId:
          publishOptions.causationId,
      } as PlatformEvent<typeof type>;

      eventHistory.push(
        event,
      );

      if (
        eventHistory.length >
        historyLimit
      ) {
        eventHistory.splice(
          0,
          eventHistory.length -
            historyLimit,
        );
      }

      queue.push(
        event,
      );
      dispatchQueue();

      return event;
    },

    subscribe(
      type,
      handler,
    ) {
      return addSubscription(
        type,
        handler as PlatformAnyEventHandler,
        false,
      );
    },

    subscribeOnce(
      type,
      handler,
    ) {
      return addSubscription(
        type,
        handler as PlatformAnyEventHandler,
        true,
      );
    },

    subscribeAll(
      handler,
    ) {
      return addSubscription(
        undefined,
        handler,
        false,
      );
    },

    history:
      readHistory,

    clearHistory() {
      eventHistory.length = 0;
    },

    size() {
      return subscriptions.size;
    },
  };
}

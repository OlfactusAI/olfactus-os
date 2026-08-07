import type {
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

export function createRuntimeReferenceRegistry(
  initial:
    RuntimeReferenceEntity[] =
      [],
) {
  let entities = [
    ...initial,
  ];

  return {
    list() {
      return [
        ...entities,
      ];
    },

    get(
      referenceId: string,
    ) {
      return entities.find(
        (entity) =>
          entity.referenceId ===
          referenceId,
      );
    },

    activate(
      entity:
        RuntimeReferenceEntity,
    ) {
      entities = [
        ...entities.filter(
          (current) =>
            current.referenceId !==
            entity.referenceId,
        ),
        entity,
      ];

      return entity;
    },

    remove(
      referenceId: string,
    ) {
      const existing =
        entities.find(
          (entity) =>
            entity.referenceId ===
            referenceId,
        );

      entities =
        entities.filter(
          (entity) =>
            entity.referenceId !==
            referenceId,
        );

      return existing;
    },
  };
}

export type RuntimeReferenceRegistry =
  ReturnType<
    typeof createRuntimeReferenceRegistry
  >;

import type {
  FragranceLineDefinition,
  LineageMetadata,
} from "@/lib/lineage/types";

export interface LineageRegistry {
  lines: FragranceLineDefinition[];
  metadata: LineageMetadata[];
}

export const emptyLineageRegistry:
  LineageRegistry = {
    lines: [],
    metadata: [],
  };

export function createLineageRegistry({
  lines = [],
  metadata = [],
}: Partial<LineageRegistry> = {}):
  LineageRegistry {
  return {
    lines: deduplicateById(lines),
    metadata:
      deduplicateMetadata(metadata),
  };
}

export function mergeLineageRegistries(
  ...registries: LineageRegistry[]
): LineageRegistry {
  return createLineageRegistry({
    lines: registries.flatMap(
      (registry) =>
        registry.lines,
    ),
    metadata:
      registries.flatMap(
        (registry) =>
          registry.metadata,
      ),
  });
}

function deduplicateById<
  Value extends {
    id: string;
    confidence: number;
  },
>(values: Value[]) {
  const byId = new Map<
    string,
    Value
  >();

  for (const value of values) {
    const existing =
      byId.get(value.id);

    if (
      !existing ||
      value.confidence >=
        existing.confidence
    ) {
      byId.set(value.id, value);
    }
  }

  return [...byId.values()];
}

function deduplicateMetadata(
  values: LineageMetadata[],
) {
  const byFragrance =
    new Map<
      string,
      LineageMetadata
    >();

  for (const value of values) {
    const existing =
      byFragrance.get(
        value.fragranceId,
      );

    if (
      !existing ||
      value.confidence >=
        existing.confidence
    ) {
      byFragrance.set(
        value.fragranceId,
        value,
      );
    }
  }

  return [
    ...byFragrance.values(),
  ];
}

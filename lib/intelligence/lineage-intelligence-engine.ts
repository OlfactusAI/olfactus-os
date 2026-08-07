import type {
  DnaDimension,
} from "@/lib/domain/fragrance";
import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import {
  inferLineageRegistry,
} from "@/lib/lineage/inference";
import {
  mergeLineageRegistries,
  type LineageRegistry,
} from "@/lib/lineage/registry";
import type {
  FragranceLine,
  LineageDnaDelta,
  LineageGraphEdge,
  LineageIntelligenceOutput,
  LineageMetadata,
  LineageNode,
} from "@/lib/lineage/types";

const dnaDimensions:
  DnaDimension[] = [
    "fresh",
    "green",
    "woody",
    "amber",
    "sweet",
    "dark",
    "artistic",
    "formal",
  ];

export function analyzeLineageIntelligence({
  database,
  registry,
  inferMissing = true,
}: {
  database: GlobalFragranceDatabase;
  registry?: LineageRegistry;
  inferMissing?: boolean;
}): LineageIntelligenceOutput {
  const inferred =
    inferMissing
      ? inferLineageRegistry(
          database,
        )
      : {
          lines: [],
          metadata: [],
        };

  const merged =
    mergeLineageRegistries(
      inferred,
      registry ?? {
        lines: [],
        metadata: [],
      },
    );

  validateRegistry({
    database,
    registry: merged,
  });

  const fragranceById =
    new Map(
      database.fragrances.map(
        (fragrance) => [
          fragrance.id,
          fragrance,
        ],
      ),
    );

  const metadataById =
    new Map(
      merged.metadata.map(
        (metadata) => [
          metadata.fragranceId,
          metadata,
        ],
      ),
    );

  const nodes =
    merged.metadata
      .map((metadata) => {
        const fragrance =
          fragranceById.get(
            metadata.fragranceId,
          );
        if (!fragrance) {
          return null;
        }

        const line =
          merged.lines.find(
            (candidate) =>
              candidate.id ===
              metadata.lineId,
          );
        if (!line) {
          return null;
        }

        const original =
          fragranceById.get(
            line.originalFragranceId,
          );
        if (!original) {
          return null;
        }

        return buildNode({
          fragrance,
          original,
          metadata,
          metadataById,
        });
      })
      .filter(
        (
          node,
        ): node is LineageNode =>
          Boolean(node),
      );

  const nodeById =
    new Map(
      nodes.map((node) => [
        node.fragranceId,
        node,
      ]),
    );

  const lines =
    merged.lines
      .map((line) =>
        buildLine({
          line,
          nodes: line.memberIds
            .map((id) =>
              nodeById.get(id),
            )
            .filter(
              (
                node,
              ): node is LineageNode =>
                Boolean(node),
            ),
        }),
      )
      .filter(
        (line) =>
          line.members.length > 0,
      );

  const edges =
    buildEdges(nodes);

  const lineageIds =
    new Set(
      nodes.map(
        (node) =>
          node.fragranceId,
      ),
    );

  return {
    modelVersion: "LIE-1.0.0",
    generatedAt:
      new Date().toISOString(),
    lines,
    nodes,
    edges,
    orphanFragranceIds:
      database.fragrances
        .filter(
          (fragrance) =>
            !lineageIds.has(
              fragrance.id,
            ),
        )
        .map(
          (fragrance) =>
            fragrance.id,
        ),
  };
}

export function calculateDnaInheritance({
  original,
  current,
}: {
  original: GlobalFragranceRecord;
  current: GlobalFragranceRecord;
}) {
  if (
    original.id === current.id
  ) {
    return 100;
  }

  const averageDifference =
    dnaDimensions.reduce(
      (sum, dimension) =>
        sum +
        Math.abs(
          original.dna[
            dimension
          ] -
            current.dna[
              dimension
            ],
        ),
      0,
    ) / dnaDimensions.length;

  return clamp(
    Math.round(
      100 -
        averageDifference,
    ),
  );
}

export function calculateEvolutionScore({
  original,
  current,
}: {
  original: GlobalFragranceRecord;
  current: GlobalFragranceRecord;
}) {
  if (
    original.id === current.id
  ) {
    return 0;
  }

  const dnaMovement =
    100 -
    calculateDnaInheritance({
      original,
      current,
    });

  const performanceMovement =
    average([
      Math.abs(
        original.performance
          .longevity -
          current.performance
            .longevity,
      ),
      Math.abs(
        original.performance
          .projection -
          current.performance
            .projection,
      ),
      Math.abs(
        (original.performance
          .sillage ?? 50) -
          (current.performance
            .sillage ?? 50),
      ),
    ]);

  const roleMovement =
    symmetricDifference(
      original.roles,
      current.roles,
    ).length * 5;

  const familyMovement =
    original.family ===
    current.family
      ? 0
      : 12;

  return clamp(
    Math.round(
      dnaMovement * 0.58 +
        performanceMovement *
          0.24 +
        roleMovement * 0.12 +
        familyMovement * 0.06,
    ),
  );
}

export function calculateOriginalityScore({
  original,
  current,
}: {
  original: GlobalFragranceRecord;
  current: GlobalFragranceRecord;
}) {
  if (
    original.id === current.id
  ) {
    return 100;
  }

  const evolution =
    calculateEvolutionScore({
      original,
      current,
    });
  const artisticGain =
    Math.max(
      0,
      current.dna.artistic -
        original.dna.artistic,
    );
  const roleGain =
    current.roles.filter(
      (role) =>
        !original.roles.includes(
          role,
        ),
    ).length;

  return clamp(
    Math.round(
      evolution * 0.72 +
        artisticGain * 0.18 +
        roleGain * 5,
    ),
  );
}

function buildNode({
  fragrance,
  original,
  metadata,
  metadataById,
}: {
  fragrance:
    GlobalFragranceRecord;
  original:
    GlobalFragranceRecord;
  metadata: LineageMetadata;
  metadataById: Map<
    string,
    LineageMetadata
  >;
}): LineageNode {
  return {
    fragranceId:
      fragrance.id,
    lineId:
      metadata.lineId,
    parentId:
      metadata.parentId,
    generation:
      metadata.generation,
    releaseOrder:
      metadata.releaseOrder,
    releaseYear:
      fragrance.releaseYear,
    relationship:
      metadata.relationship,
    status:
      metadata.status,
    concentrationId:
      metadata.concentrationId ??
      fragrance.concentrationId,
    dnaInheritance:
      calculateDnaInheritance({
        original,
        current: fragrance,
      }),
    evolutionScore:
      calculateEvolutionScore({
        original,
        current: fragrance,
      }),
    originalityScore:
      calculateOriginalityScore({
        original,
        current: fragrance,
      }),
    performanceDelta: {
      longevity:
        fragrance.performance
          .longevity -
        original.performance
          .longevity,
      projection:
        fragrance.performance
          .projection -
        original.performance
          .projection,
      sillage:
        fragrance.performance
          .sillage ===
          undefined &&
        original.performance
          .sillage ===
          undefined
          ? null
          : (fragrance
              .performance
              .sillage ??
              50) -
            (original.performance
              .sillage ??
              50),
    },
    dnaDeltas:
      buildDnaDeltas({
        original,
        current: fragrance,
      }),
    children: [
      ...metadataById.values(),
    ]
      .filter(
        (candidate) =>
          candidate.parentId ===
          fragrance.id,
      )
      .map(
        (candidate) =>
          candidate.fragranceId,
      ),
    successorId:
      metadata.successorId,
    predecessorId:
      metadata.predecessorId,
    inspiredByIds:
      metadata.inspiredByIds ??
      [],
    cloneOfIds:
      metadata.cloneOfIds ??
      [],
    confidence:
      metadata.confidence,
  };
}

function buildDnaDeltas({
  original,
  current,
}: {
  original:
    GlobalFragranceRecord;
  current:
    GlobalFragranceRecord;
}): LineageDnaDelta[] {
  return dnaDimensions.map(
    (dimension) => ({
      dimension,
      original:
        original.dna[
          dimension
        ],
      current:
        current.dna[
          dimension
        ],
      delta:
        current.dna[
          dimension
        ] -
        original.dna[
          dimension
        ],
    }),
  );
}

function buildLine({
  line,
  nodes,
}: {
  line: {
    id: string;
    canonicalName: string;
    brandId: string;
    originalFragranceId: string;
    confidence: number;
  };
  nodes: LineageNode[];
}): FragranceLine {
  const ordered =
    [...nodes].sort(
      (a, b) =>
        a.releaseOrder -
          b.releaseOrder ||
        (a.releaseYear ??
          Number.MAX_SAFE_INTEGER) -
          (b.releaseYear ??
            Number.MAX_SAFE_INTEGER),
    );

  return {
    id: line.id,
    canonicalName:
      line.canonicalName,
    brandId:
      line.brandId,
    originalFragranceId:
      line.originalFragranceId,
    members: ordered,
    chronology:
      ordered.map(
        (node) =>
          node.fragranceId,
      ),
    activeMemberIds:
      ordered
        .filter(
          (node) =>
            node.status ===
            "active",
        )
        .map(
          (node) =>
            node.fragranceId,
        ),
    discontinuedMemberIds:
      ordered
        .filter(
          (node) =>
            node.status ===
            "discontinued",
        )
        .map(
          (node) =>
            node.fragranceId,
        ),
    averageInheritance:
      average(
        ordered.map(
          (node) =>
            node.dnaInheritance,
        ),
      ),
    averageEvolution:
      average(
        ordered.map(
          (node) =>
            node.evolutionScore,
        ),
      ),
    confidence:
      line.confidence,
  };
}

function buildEdges(
  nodes: LineageNode[],
): LineageGraphEdge[] {
  const edges:
    LineageGraphEdge[] = [];

  for (const node of nodes) {
    if (node.parentId) {
      edges.push({
        sourceId:
          node.parentId,
        targetId:
          node.fragranceId,
        type: "parent-child",
        confidence:
          node.confidence,
      });
    }

    if (node.successorId) {
      edges.push({
        sourceId:
          node.fragranceId,
        targetId:
          node.successorId,
        type: "successor",
        confidence:
          node.confidence,
      });
    }

    if (node.predecessorId) {
      edges.push({
        sourceId:
          node.fragranceId,
        targetId:
          node.predecessorId,
        type: "predecessor",
        confidence:
          node.confidence,
      });
    }

    for (const targetId of node.cloneOfIds) {
      edges.push({
        sourceId:
          node.fragranceId,
        targetId,
        type: "clone",
        confidence:
          node.confidence,
      });
    }

    for (const targetId of node.inspiredByIds) {
      edges.push({
        sourceId:
          node.fragranceId,
        targetId,
        type: "inspired-by",
        confidence:
          node.confidence,
      });
    }
  }

  return deduplicateEdges(
    edges,
  );
}

function validateRegistry({
  database,
  registry,
}: {
  database:
    GlobalFragranceDatabase;
  registry:
    LineageRegistry;
}) {
  const fragranceIds =
    new Set(
      database.fragrances.map(
        (fragrance) =>
          fragrance.id,
      ),
    );
  const lineIds =
    new Set(
      registry.lines.map(
        (line) => line.id,
      ),
    );

  for (const line of registry.lines) {
    if (
      !fragranceIds.has(
        line.originalFragranceId,
      )
    ) {
      throw new Error(
        `Unknown original fragrance: ${line.originalFragranceId}`,
      );
    }

    for (const memberId of line.memberIds) {
      if (
        !fragranceIds.has(
          memberId,
        )
      ) {
        throw new Error(
          `Unknown lineage member: ${memberId}`,
        );
      }
    }
  }

  for (const metadata of registry.metadata) {
    if (
      !fragranceIds.has(
        metadata.fragranceId,
      )
    ) {
      throw new Error(
        `Unknown lineage fragrance: ${metadata.fragranceId}`,
      );
    }
    if (
      !lineIds.has(
        metadata.lineId,
      )
    ) {
      throw new Error(
        `Unknown fragrance line: ${metadata.lineId}`,
      );
    }
    if (
      metadata.parentId &&
      !fragranceIds.has(
        metadata.parentId,
      )
    ) {
      throw new Error(
        `Unknown lineage parent: ${metadata.parentId}`,
      );
    }
  }
}

function deduplicateEdges(
  edges: LineageGraphEdge[],
) {
  const byKey = new Map<
    string,
    LineageGraphEdge
  >();

  for (const edge of edges) {
    const key = [
      edge.sourceId,
      edge.targetId,
      edge.type,
    ].join(":");

    const existing =
      byKey.get(key);

    if (
      !existing ||
      edge.confidence >
        existing.confidence
    ) {
      byKey.set(key, edge);
    }
  }

  return [...byKey.values()];
}

function symmetricDifference<
  Value extends string,
>(
  first: readonly Value[],
  second: readonly Value[],
) {
  const firstSet =
    new Set(first);
  const secondSet =
    new Set(second);

  return [
    ...first.filter(
      (value) =>
        !secondSet.has(value),
    ),
    ...second.filter(
      (value) =>
        !firstSet.has(value),
    ),
  ];
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

function clamp(value: number) {
  return Math.max(
    0,
    Math.min(100, value),
  );
}

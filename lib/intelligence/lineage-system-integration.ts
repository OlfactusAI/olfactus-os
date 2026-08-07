import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";
import {
  analyzeLineageIntelligence,
} from "@/lib/intelligence/lineage-intelligence-engine";
import {
  analyzeUpgrade,
} from "@/lib/intelligence/upgrade-intelligence-engine";
import {
  inferLineageRegistry,
} from "@/lib/lineage/inference";

export interface LineageSystemContext {
  fragranceId: string;
  hasKnownLineage: boolean;
  lineId?: string;
  lineName?: string;
  originalFragranceId?: string;
  memberIds: string[];
  memberCount: number;
  generation?: number;
  relationship?: string;
  dnaInheritance?: number;
  evolutionScore?: number;
  bestUpgradeCandidateId?: string;
  buyConfidence?: number;
  upgradeVerdict?: string;
  graphNodeId?: string;
  lineageHref: string;
  graphHref: string;
}

export function buildLineageSystemIndex({
  catalog,
  collection,
}: {
  catalog: FragranceRecord[];
  collection: CollectionItem[];
}) {
  const database =
    buildGlobalFragranceDatabase({
      catalog,
    });
  const registry =
    inferLineageRegistry(database);
  const intelligence =
    analyzeLineageIntelligence({
      database,
      registry,
      inferMissing: false,
    });
  const ownedIds =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );

  const contexts =
    new Map<
      string,
      LineageSystemContext
    >();

  for (const fragrance of database.fragrances) {
    const node =
      intelligence.nodes.find(
        (candidate) =>
          candidate.fragranceId ===
          fragrance.id,
      );
    const line =
      node
        ? intelligence.lines.find(
            (candidate) =>
              candidate.id ===
              node.lineId,
          )
        : undefined;

    let upgrade:
      | ReturnType<
          typeof analyzeUpgrade
        >
      | undefined;

    if (line) {
      const ownedFragrance =
        line.members
          .map((member) =>
            database.fragrances.find(
              (candidate) =>
                candidate.id ===
                member.fragranceId,
            ),
          )
          .find(
            (candidate) =>
              candidate &&
              ownedIds.has(
                candidate.id,
              ),
          );

      const candidateFragrance =
        line.members
          .map((member) =>
            database.fragrances.find(
              (candidate) =>
                candidate.id ===
                member.fragranceId,
            ),
          )
          .find(
            (candidate) =>
              candidate &&
              !ownedIds.has(
                candidate.id,
              ),
          );

      if (
        ownedFragrance &&
        candidateFragrance
      ) {
        upgrade = analyzeUpgrade({
          owned:
            ownedFragrance,
          candidate:
            candidateFragrance,
          collection,
        });
      }
    }

    contexts.set(
      fragrance.id,
      {
        fragranceId:
          fragrance.id,
        hasKnownLineage:
          Boolean(line && node),
        lineId:
          line?.id,
        lineName:
          line?.canonicalName,
        originalFragranceId:
          line?.originalFragranceId,
        memberIds:
          line?.members.map(
            (member) =>
              member.fragranceId,
          ) ?? [],
        memberCount:
          line?.members.length ?? 0,
        generation:
          node?.generation,
        relationship:
          node?.relationship,
        dnaInheritance:
          node?.dnaInheritance,
        evolutionScore:
          node?.evolutionScore,
        bestUpgradeCandidateId:
          upgrade
            ?.candidateFragranceId,
        buyConfidence:
          upgrade?.buyConfidence,
        upgradeVerdict:
          upgrade?.verdict,
        graphNodeId:
          `fragrance:${fragrance.id}`,
        lineageHref:
          `/lineage?fragrance=${encodeURIComponent(
            fragrance.id,
          )}`,
        graphHref:
          `/graph?fragrance=${encodeURIComponent(
            fragrance.id,
          )}`,
      },
    );
  }

  return {
    database,
    intelligence,
    contexts,
  };
}

export function getLineageSystemContext({
  fragranceId,
  catalog,
  collection,
}: {
  fragranceId: string;
  catalog: FragranceRecord[];
  collection: CollectionItem[];
}) {
  return (
    buildLineageSystemIndex({
      catalog,
      collection,
    }).contexts.get(
      fragranceId,
    ) ?? {
      fragranceId,
      hasKnownLineage: false,
      memberIds: [],
      memberCount: 0,
      graphNodeId:
        `fragrance:${fragranceId}`,
      lineageHref:
        `/lineage?fragrance=${encodeURIComponent(
          fragranceId,
        )}`,
      graphHref:
        `/graph?fragrance=${encodeURIComponent(
          fragranceId,
        )}`,
    }
  );
}

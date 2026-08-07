"use client";

import {
  use,
  useMemo,
} from "react";

import {
  EntityDossier,
} from "@/components/entities/entity-dossier";
import {
  EntityNotFound,
} from "@/components/entities/entity-not-found";
import {
  useActiveFragranceCatalog,
} from "@/components/providers/active-catalog-provider";
import {
  buildEntityRegistry,
  resolveEntity,
} from "@/lib/entities/registry";
import type {
  EntityType,
} from "@/lib/entities/types";

const supportedTypes =
  new Set<EntityType>([
    "fragrance",
    "brand",
    "perfumer",
    "note",
    "accord",
    "family",
  ]);

export default function UniversalEntityPage({
  params,
}: {
  params:
    Promise<{
      type: string;
      identifier: string;
    }>;
}) {
  const {
    catalog,
  } =
    useActiveFragranceCatalog();
  const resolvedParams =
    use(params);
  const registry =
    useMemo(
      () =>
        buildEntityRegistry(
          catalog,
        ),
      [catalog],
    );

  if (
    !supportedTypes.has(
      resolvedParams.type as
        EntityType,
    )
  ) {
    return (
      <EntityNotFound
        type={
          resolvedParams.type
        }
        identifier={
          resolvedParams.identifier
        }
      />
    );
  }

  const entity =
    resolveEntity(
      registry,
      resolvedParams.type as
        EntityType,
      decodeURIComponent(
        resolvedParams.identifier,
      ),
    );

  if (!entity) {
    return (
      <EntityNotFound
        type={
          resolvedParams.type
        }
        identifier={
          resolvedParams.identifier
        }
      />
    );
  }

  return (
    <EntityDossier
      entity={entity}
    />
  );
}


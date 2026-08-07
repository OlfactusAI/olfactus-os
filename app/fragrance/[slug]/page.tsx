"use client";

import {
  use,
  useEffect,
  useMemo,
} from "react";
import {
  useRouter,
} from "next/navigation";

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

export default function LegacyFragranceRoute({
  params,
}: {
  params:
    Promise<{
      slug: string;
    }>;
}) {
  const {
    slug,
  } = use(params);
  const router =
    useRouter();
  const {
    catalog,
  } =
    useActiveFragranceCatalog();
  const registry =
    useMemo(
      () =>
        buildEntityRegistry(
          catalog,
        ),
      [catalog],
    );
  const entity =
    resolveEntity(
      registry,
      "fragrance",
      slug,
    );

  useEffect(() => {
    if (entity) {
      router.replace(
        `/entity/fragrance/${entity.id}`,
      );
    }
  }, [
    entity,
    router,
  ]);

  if (!entity) {
    return (
      <EntityNotFound
        type="fragrance"
        identifier={slug}
      />
    );
  }

  return (
    <main className="entity-route-loading">
      Opening the dynamic entity dossier…
    </main>
  );
}

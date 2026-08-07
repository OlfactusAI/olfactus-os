import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildEntityRegistry,
} from "@/lib/entities/registry";
import {
  diagnoseEntityRegistry,
} from "@/lib/entities/diagnostics";

export function collectEntityDiagnostics(
  catalog:
    FragranceRecord[],
) {
  const registry =
    buildEntityRegistry(
      catalog,
    );

  return diagnoseEntityRegistry(
    registry,
  );
}

export function measureEntityRegistryBuildTime(
  catalog:
    FragranceRecord[],
) {
  const started =
    performance.now();

  buildEntityRegistry(
    catalog,
  );

  return (
    Math.round(
      (
        performance.now() -
        started
      ) * 100,
    ) / 100
  );
}

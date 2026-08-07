import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import {
  buildGlobalDatabaseSnapshot,
} from "@/lib/database/core/builder";
import {
  GlobalDatabaseRepository,
} from "@/lib/database/core/repository";

let repository:
  GlobalDatabaseRepository | null =
    null;

export function getGlobalDatabaseRepository() {
  if (!repository) {
    repository =
      new GlobalDatabaseRepository(
        buildGlobalDatabaseSnapshot({
          catalog:
            bundledIntelligenceCatalog,
        }),
      );
  }

  return repository;
}

export function resetGlobalDatabaseRepository() {
  repository = null;
}

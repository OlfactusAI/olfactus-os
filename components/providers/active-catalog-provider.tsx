"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { bundledIntelligenceCatalog as bundledFragrances } from "@/lib/data/intelligence-catalog";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { loadImportedCatalog } from "@/lib/database/import/storage";
import {
  assessImportedFragranceReadiness,
  type ImportedDataReadiness,
} from "@/lib/database/imported-readiness";

export const activeCatalogRefreshEvent =
  "olfactus:active-catalog-refresh";

interface ActiveCatalogContextValue {
  catalog: FragranceRecord[];
  bundledCatalog: FragranceRecord[];
  importedCatalog: FragranceRecord[];
  importedIds: Set<string>;
  readinessById: Map<string, ImportedDataReadiness>;
  isHydrated: boolean;
  refreshCatalog: () => void;
}

const ActiveCatalogContext =
  createContext<ActiveCatalogContextValue | null>(null);

export function ActiveCatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [importedCatalog, setImportedCatalog] =
    useState<FragranceRecord[]>([]);
  const [isHydrated, setIsHydrated] =
    useState(false);

  const refreshCatalog = useCallback(() => {
    setImportedCatalog(loadImportedCatalog());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    refreshCatalog();

    const refresh = () => refreshCatalog();
    const storage = (event: StorageEvent) => {
      if (event.key === "olfactus:imported-catalog:v1") {
        refreshCatalog();
      }
    };

    window.addEventListener(activeCatalogRefreshEvent, refresh);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(activeCatalogRefreshEvent, refresh);
      window.removeEventListener("storage", storage);
    };
  }, [refreshCatalog]);

  const importedIds = useMemo(
    () => new Set(importedCatalog.map((item) => item.id)),
    [importedCatalog],
  );

  const catalog = useMemo(() => {
    const byId = new Map<string, FragranceRecord>();
    for (const item of [...bundledFragrances, ...importedCatalog]) {
      byId.set(item.id, item);
    }
    return [...byId.values()];
  }, [importedCatalog]);

  const readinessById = useMemo(
    () => new Map(
      importedCatalog.map((item) => [
        item.id,
        assessImportedFragranceReadiness(item),
      ]),
    ),
    [importedCatalog],
  );

  const value = useMemo<ActiveCatalogContextValue>(
    () => ({
      catalog,
      bundledCatalog: bundledFragrances,
      importedCatalog,
      importedIds,
      readinessById,
      isHydrated,
      refreshCatalog,
    }),
    [
      catalog,
      importedCatalog,
      importedIds,
      readinessById,
      isHydrated,
      refreshCatalog,
    ],
  );

  return (
    <ActiveCatalogContext.Provider value={value}>
      {children}
    </ActiveCatalogContext.Provider>
  );
}

export function useActiveFragranceCatalog() {
  const context = useContext(ActiveCatalogContext);
  if (!context) {
    throw new Error(
      "useActiveFragranceCatalog must be used within ActiveCatalogProvider",
    );
  }
  return context;
}

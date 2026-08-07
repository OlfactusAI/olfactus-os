"use client";

import { Database } from "lucide-react";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";

export function ActiveCatalogStatus() {
  const { importedCatalog, isHydrated } =
    useActiveFragranceCatalog();

  if (!isHydrated || importedCatalog.length === 0) {
    return null;
  }

  return (
    <span className="active-catalog-status">
      <Database size={13} />
      {importedCatalog.length} imported active
    </span>
  );
}

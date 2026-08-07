"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";

export function ImportedDataBadge({
  fragranceId,
  compact = false,
}: {
  fragranceId: string;
  compact?: boolean;
}) {
  const { importedIds, readinessById } =
    useActiveFragranceCatalog();

  if (!importedIds.has(fragranceId)) return null;
  const readiness = readinessById.get(fragranceId);
  if (!readiness) return null;

  const Icon =
    readiness.level === "ready"
      ? CheckCircle2
      : readiness.level === "search-only"
        ? Search
        : AlertTriangle;

  return (
    <span
      className={`imported-data-badge imported-data-badge-${readiness.level}`}
      title={readiness.explanation}
    >
      <Icon size={12} />
      {compact ? "Imported" : `Imported · ${readiness.label}`}
    </span>
  );
}

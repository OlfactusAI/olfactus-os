import { createHash } from "node:crypto";
import type { FrozenResearchPack } from "@/lib/os/contracts/evidence";

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

export function canonicalResearchPackPayload(pack: FrozenResearchPack): string {
  const { integrityHash: _integrityHash, ...payload } = pack;
  return JSON.stringify(stableValue(payload));
}

export function computeResearchPackIntegrityHash(pack: FrozenResearchPack): string {
  return `sha256:${createHash("sha256")
    .update(canonicalResearchPackPayload(pack), "utf8")
    .digest("hex")}`;
}

export function assertResearchPackIntegrity(pack: FrozenResearchPack): void {
  const actual = computeResearchPackIntegrityHash(pack);
  if (actual !== pack.integrityHash) {
    throw new Error(`Research pack integrity mismatch. Expected ${pack.integrityHash}, got ${actual}.`);
  }
}

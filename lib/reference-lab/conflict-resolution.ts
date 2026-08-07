import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceCalibrationConflict,
} from "@/lib/reference-lab/types";
import type {
  ReferenceConflictResolution,
} from "@/lib/reference-lab/consensus-types";

export function resolveReferenceConflict({
  conflict,
  status,
  resolution,
  resolvedBy,
  resolvedAt,
}: {
  conflict:
    ReferenceCalibrationConflict;
  status:
    ReferenceConflictResolution["status"];
  resolution: string;
  resolvedBy: string;
  resolvedAt: string;
}) {
  if (
    conflict.status !==
    "open"
  ) {
    throw new Error(
      "Only open calibration conflicts can be resolved.",
    );
  }

  if (
    !resolution.trim()
  ) {
    throw new Error(
      "Conflict resolution requires an explanation.",
    );
  }

  const record:
    ReferenceConflictResolution = {
    resolutionId:
      createReferenceLabId(
        "ref-conflict-resolution",
        [
          conflict.conflictId,
          resolvedBy,
          resolvedAt,
        ],
      ),
    conflictId:
      conflict.conflictId,
    status,
    resolution:
      resolution.trim(),
    resolvedBy,
    resolvedAt,
  };

  const updated:
    ReferenceCalibrationConflict = {
    ...conflict,
    status,
    resolution:
      record.resolution,
    resolvedBy,
    resolvedAt,
  };

  return {
    conflict:
      updated,
    resolution:
      record,
  };
}

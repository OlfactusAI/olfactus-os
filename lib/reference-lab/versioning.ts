import type {
  ReferenceCalibrationVersion,
} from "@/lib/reference-lab/types";
import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";

export function createCalibrationVersion({
  sessionId,
  fragranceId,
  version,
  createdBy,
  createdAt,
  previousVersionId,
  changeSummary,
}: {
  sessionId: string;
  fragranceId: string;
  version: string;
  createdBy: string;
  createdAt: string;
  previousVersionId?: string;
  changeSummary?: string;
}): ReferenceCalibrationVersion {
  return {
    versionId:
      createReferenceLabId(
        "ref-version",
        [
          fragranceId,
          version,
        ],
      ),
    sessionId,
    fragranceId,
    version,
    status:
      "draft",
    createdAt,
    createdBy,
    previousVersionId,
    changeSummary,
  };
}

export function lockCalibrationVersion({
  version,
  lockedBy,
  lockedAt,
}: {
  version:
    ReferenceCalibrationVersion;
  lockedBy: string;
  lockedAt: string;
}): ReferenceCalibrationVersion {
  if (
    version.lockedAt
  ) {
    return version;
  }

  return {
    ...version,
    status:
      version.status ===
      "gold-standard"
        ? "gold-standard"
        : "validated",
    lockedAt,
    lockedBy,
  };
}

export function isCalibrationVersionLocked(
  version:
    ReferenceCalibrationVersion,
) {
  return Boolean(
    version.lockedAt,
  );
}

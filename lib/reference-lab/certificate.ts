import type {
  GoldStandardCertificate,
  ReferenceCalibrationVersion,
  ReferenceConsensusSnapshot,
} from "@/lib/reference-lab/types";
import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";

export function createGoldStandardCertificate({
  version,
  consensus,
  issuedBy,
  issuedAt,
  referenceQuality,
  evidenceCompleteness,
}: {
  version:
    ReferenceCalibrationVersion;
  consensus:
    ReferenceConsensusSnapshot;
  issuedBy: string;
  issuedAt: string;
  referenceQuality: number;
  evidenceCompleteness: number;
}): GoldStandardCertificate {
  if (
    version.status !==
    "gold-standard"
  ) {
    throw new Error(
      "Only a gold-standard calibration version can receive a Gold Standard certificate.",
    );
  }

  if (
    !version.lockedAt
  ) {
    throw new Error(
      "Gold Standard calibration versions must be locked before certification.",
    );
  }

  if (
    consensus.unresolvedConflictCount >
    0
  ) {
    throw new Error(
      "Gold Standard certification requires zero unresolved calibration conflicts.",
    );
  }

  return {
    certificateId:
      createReferenceLabId(
        "ref-certificate",
        [
          version.fragranceId,
          version.version,
        ],
      ),
    sessionId:
      version.sessionId,
    fragranceId:
      version.fragranceId,
    versionId:
      version.versionId,
    calibrationVersion:
      version.version,
    issuedAt,
    issuedBy,
    referenceQuality:
      clampScore(
        referenceQuality,
      ),
    evidenceCompleteness:
      clampScore(
        evidenceCompleteness,
      ),
    consensusConfidence:
      clampScore(
        consensus.averageConfidence,
      ),
    unresolvedConflictCount:
      consensus.unresolvedConflictCount,
    locked: true,
  };
}

function clampScore(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        value,
      ),
    ),
  );
}

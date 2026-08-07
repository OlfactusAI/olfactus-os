import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceGoldStandardCertificate,
} from "@/lib/reference-lab/certification-types";
import type {
  ReferenceRegistryRecord,
  ReferenceRegistryTimelineEvent,
} from "@/lib/reference-registry/types";

export function registerCertifiedReference({
  certificate,
  actor,
  timestamp,
}: {
  certificate:
    ReferenceGoldStandardCertificate;
  actor: string;
  timestamp: string;
}): ReferenceRegistryRecord {
  const referenceId =
    createReferenceLabId(
      "ref-registry",
      [
        certificate.fragranceId,
      ],
    );

  return {
    referenceId,
    fragranceId:
      certificate.fragranceId,
    currentVersionId:
      certificate.versionId,
    currentCertificateId:
      certificate.certificateId,
    lifecycle:
      "registered",
    productionStatus:
      "not-reviewed",
    confidence:
      certificate.consensusConfidence,
    evidenceCompleteness:
      certificate.evidenceCompleteness,
    referenceQuality:
      certificate.referenceQuality,
    reviewerCount:
      certificate.reviewerCount,
    coverage:
      emptyCoverage(),
    versions: [
      {
        versionId:
          certificate.versionId,
        calibrationVersion:
          certificate.calibrationVersion,
        certificateId:
          certificate.certificateId,
        certificateHash:
          certificate.certificateHash,
        status:
          "gold-standard",
        certifiedAt:
          certificate.issuedAt,
      },
    ],
    timeline: [
      timelineEvent({
        referenceId,
        type:
          "registered",
        timestamp,
        actor,
        detail:
          `Registered Gold Standard certificate ${certificate.certificateId}.`,
      }),
    ],
    certificate,
    createdAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}

export function addRegistryTimelineEvent({
  record,
  type,
  actor,
  timestamp,
  detail,
}: {
  record:
    ReferenceRegistryRecord;
  type:
    ReferenceRegistryTimelineEvent["type"];
  actor: string;
  timestamp: string;
  detail: string;
}): ReferenceRegistryRecord {
  return {
    ...record,
    timeline: [
      ...record.timeline,
      timelineEvent({
        referenceId:
          record.referenceId,
        type,
        actor,
        timestamp,
        detail,
      }),
    ],
    updatedAt:
      timestamp,
  };
}

export function updateRegistryCoverage({
  record,
  coverage,
  timestamp,
}: {
  record:
    ReferenceRegistryRecord;
  coverage:
    Partial<
      ReferenceRegistryRecord["coverage"]
    >;
  timestamp: string;
}) {
  return {
    ...record,
    coverage: {
      ...record.coverage,
      ...coverage,
    },
    updatedAt:
      timestamp,
  };
}

function emptyCoverage() {
  return {
    similarity: 0,
    recommendation: 0,
    collectionTwin: 0,
    decisionLab: 0,
    weather: 0,
    blindBuy: 0,
    globalIntelligence: 0,
  };
}

function timelineEvent({
  referenceId,
  type,
  timestamp,
  actor,
  detail,
}: {
  referenceId: string;
  type:
    ReferenceRegistryTimelineEvent["type"];
  timestamp: string;
  actor: string;
  detail: string;
}): ReferenceRegistryTimelineEvent {
  return {
    eventId:
      createReferenceLabId(
        "ref-registry-event",
        [
          referenceId,
          type,
          timestamp,
        ],
      ),
    type,
    timestamp,
    actor,
    detail,
  };
}

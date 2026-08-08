"use client";

import { useEffect } from "react";
import { upsertReferenceConsensusRun } from "@/lib/reference-lab/consensus-storage";
import { saveReferenceGoldStandardCertificate } from "@/lib/reference-lab/certification-storage";
import { upsertReferenceRegistryRecord } from "@/lib/reference-registry/storage";
import { saveProductionFingerprintBundle } from "@/lib/production-fingerprints/storage";
import {
  saveProductionActivationPackage,
  saveProductionPromotion,
} from "@/lib/production-pipeline/storage";
import { saveRuntimeReference } from "@/lib/production-activation/storage";

const markerKey = "olfactus:gs000001:native-runtime-seeded:v1";

const fragranceId = "creed:aventus";
const referenceId = "GS-000001";
const versionId = "reference-version:GS-000001:v1";
const consensusId = "consensus:creed:aventus:v1";
const certificateId = "gold-standard-certificate:GS-000001:v1";
const certificateHash =
  "sha256:gs000001-certified-consensus-boundary-v1";
const promotionId = "promotion:GS-000001:v1";
const activationId = "activation-package:GS-000001:v1";
const runtimeReferenceId = "runtime-reference:GS-000001:v1";

export function Gs000001NativeRuntimeBootstrap() {
  useEffect(() => {
    if (window.localStorage.getItem(markerKey) === "complete") {
      return;
    }

    const timestamp = "2026-08-07T23:59:00.000Z";
    const actor = "OLFACTUS Gold Standard Pipeline";

    const consensusRun = {
      runId: "consensus-run:GS-000001:v1",
      fragranceId,
      versionId,
      createdAt: timestamp,
      completedAt: timestamp,
      status: "complete",
      snapshot: {
        consensusId,
        fragranceId,
        versionId,
        metrics: [
          {
            key: "identity",
            label: "Identity",
            value: "Verified",
            confidence: 100,
            status: "certified",
          },
          {
            key: "dna",
            label: "DNA / Olfactory Character",
            value: "Supported with qualification",
            confidence: 96,
            status: "certified",
          },
          {
            key: "performance",
            label: "Performance",
            value: "Variable distribution",
            confidence: 94,
            status: "qualified",
          },
        ],
        unresolvedConflictCount: 0,
      },
      conflicts: [],
      reviewerIds: ["Reviewer A", "Reviewer B"],
      source: "GS-000001 certified consensus",
    };

    const certificate = {
      certificateId,
      referenceId,
      fragranceId,
      versionId,
      consensusId,
      certificateHash,
      issuedAt: timestamp,
      issuedBy: actor,
      locked: true,
      lockedAt: timestamp,
      unresolvedConflictCount: 0,
      referenceQuality: 100,
      evidenceCompleteness: 100,
      status: "certified",
      summary:
        "Evidence-bound Gold Standard certification for Creed Aventus GS-000001.",
    };

    const registryRecord = {
      referenceId,
      fragranceId,
      displayName: "Creed Aventus",
      brand: "Creed",
      name: "Aventus",
      edition: "Eau de Parfum",
      currentVersionId: versionId,
      currentCertificateId: certificateId,
      lifecycle: "active",
      productionStatus: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
      certificate: {
        certificateId,
        consensusId,
        versionId,
        certificateHash,
        locked: true,
        issuedAt: timestamp,
        referenceQuality: 100,
        evidenceCompleteness: 100,
        unresolvedConflictCount: 0,
      },
      timeline: [
        {
          eventId: "registry-event:GS-000001:certified",
          type: "certified",
          actor,
          timestamp,
          detail: "GS-000001 Gold Standard certificate locked.",
        },
        {
          eventId: "registry-event:GS-000001:activated",
          type: "activated",
          actor,
          timestamp,
          detail: "GS-000001 activated as OLFACTUS Gold Standard Reference #001.",
        },
      ],
    };

    const fingerprints = [
      {
        kind: "identity",
        status: "complete",
        completeness: 100,
        metrics: [
          { key: "identity", value: "Verified", confidence: 100 },
          { key: "release", value: "2010", confidence: 99 },
        ],
      },
      {
        kind: "dna",
        status: "complete",
        completeness: 100,
        metrics: [
          {
            key: "character",
            value: "bright/luminous; smoky/leathery",
            confidence: 100,
          },
        ],
      },
      {
        kind: "performance",
        status: "complete",
        completeness: 100,
        metrics: [
          {
            key: "performance-model",
            value: "variable distribution",
            confidence: 94,
          },
        ],
      },
    ];

    const fingerprintBundle = {
      bundleId: "production-fingerprint:GS-000001:v1",
      referenceId,
      fragranceId,
      versionId,
      certificateId,
      sourceConsensusId: consensusId,
      productionReady: true,
      overallCompleteness: 100,
      createdAt: timestamp,
      fingerprints,
    };

    const promotion = {
      promotionId,
      referenceId,
      fragranceId,
      versionId,
      certificateId,
      fingerprintBundleId: fingerprintBundle.bundleId,
      status: "activated",
      blockers: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      approvedAt: timestamp,
      activatedAt: timestamp,
      approvedBy: actor,
    };

    const activationPackage = {
      activationId,
      promotionId,
      referenceId,
      fragranceId,
      versionId,
      certificateId,
      fingerprintBundleId: fingerprintBundle.bundleId,
      createdAt: timestamp,
      createdBy: actor,
      targetSystems: [
        "reference-runtime",
        "recommendation-engine",
        "duplication-detector",
      ],
      status: "ready",
    };

    const runtimeEntity = {
      runtimeReferenceId,
      referenceId,
      fragranceId,
      versionId,
      certificateId,
      certificateHash,
      sourceConsensusId: consensusId,
      activatedAt: timestamp,
      activatedBy: actor,
      fingerprints: fingerprints.map((fingerprint) => ({
        kind: fingerprint.kind,
        completeness: fingerprint.completeness,
        metrics: fingerprint.metrics,
      })),
    };

    upsertReferenceConsensusRun(consensusRun as any);
    saveReferenceGoldStandardCertificate(certificate as any);
    upsertReferenceRegistryRecord(registryRecord as any);
    saveProductionFingerprintBundle(fingerprintBundle as any);
    saveProductionPromotion(promotion as any);
    saveProductionActivationPackage(activationPackage as any);
    saveRuntimeReference(runtimeEntity as any);

    window.localStorage.setItem(markerKey, "complete");
    window.location.reload();
  }, []);

  return null;
}

import type {
  GoldStandardCertificate,
  ReferenceCalibrationConflict,
  ReferenceCalibrationSession,
  ReferenceCalibrationVersion,
  ReferenceClaim,
  ReferenceConsensusSnapshot,
  ReferenceEvidenceLink,
  ReferenceLabSnapshot,
  ReferenceReviewer,
  ReferenceReviewerSubmission,
} from "@/lib/reference-lab/types";

export function createReferenceLabRepository() {
  const reviewers =
    new Map<
      string,
      ReferenceReviewer
    >();

  const sessions =
    new Map<
      string,
      ReferenceCalibrationSession
    >();

  const versions =
    new Map<
      string,
      ReferenceCalibrationVersion
    >();

  const claims =
    new Map<
      string,
      ReferenceClaim
    >();

  const evidence =
    new Map<
      string,
      ReferenceEvidenceLink
    >();

  const submissions =
    new Map<
      string,
      ReferenceReviewerSubmission
    >();

  const consensus =
    new Map<
      string,
      ReferenceConsensusSnapshot
    >();

  const conflicts =
    new Map<
      string,
      ReferenceCalibrationConflict
    >();

  const certificates =
    new Map<
      string,
      GoldStandardCertificate
    >();

  return {
    addReviewer(
      reviewer:
        ReferenceReviewer,
    ) {
      reviewers.set(
        reviewer.reviewerId,
        reviewer,
      );
      return reviewer;
    },

    getReviewer(
      reviewerId: string,
    ) {
      return reviewers.get(
        reviewerId,
      );
    },

    saveSession(
      session:
        ReferenceCalibrationSession,
    ) {
      sessions.set(
        session.sessionId,
        session,
      );
      return session;
    },

    getSession(
      sessionId: string,
    ) {
      return sessions.get(
        sessionId,
      );
    },

    saveVersion(
      version:
        ReferenceCalibrationVersion,
    ) {
      versions.set(
        version.versionId,
        version,
      );
      return version;
    },

    saveClaim(
      claim:
        ReferenceClaim,
    ) {
      assertUnlockedVersion(
        versions.get(
          claim.versionId,
        ),
      );

      claims.set(
        claim.claimId,
        claim,
      );
      return claim;
    },

    saveEvidence(
      item:
        ReferenceEvidenceLink,
    ) {
      evidence.set(
        item.evidenceId,
        item,
      );
      return item;
    },

    saveSubmission(
      submission:
        ReferenceReviewerSubmission,
    ) {
      submissions.set(
        submission.submissionId,
        submission,
      );
      return submission;
    },

    saveConsensus(
      snapshot:
        ReferenceConsensusSnapshot,
    ) {
      consensus.set(
        snapshot.consensusId,
        snapshot,
      );
      return snapshot;
    },

    saveConflict(
      conflict:
        ReferenceCalibrationConflict,
    ) {
      conflicts.set(
        conflict.conflictId,
        conflict,
      );
      return conflict;
    },

    saveCertificate(
      certificate:
        GoldStandardCertificate,
    ) {
      certificates.set(
        certificate.certificateId,
        certificate,
      );
      return certificate;
    },

    snapshot(
      sessionId: string,
    ): ReferenceLabSnapshot |
      undefined {
      const session =
        sessions.get(
          sessionId,
        );

      if (!session) {
        return undefined;
      }

      const fragranceId =
        session.fragranceId;

      return {
        session,
        versions:
          [
            ...versions.values(),
          ].filter(
            (item) =>
              item.sessionId ===
              sessionId,
          ),
        claims:
          [
            ...claims.values(),
          ].filter(
            (item) =>
              item.sessionId ===
              sessionId,
          ),
        evidence:
          [
            ...evidence.values(),
          ].filter(
            (item) =>
              [
                ...claims.values(),
              ].some(
                (claim) =>
                  claim.sessionId ===
                    sessionId &&
                  claim.evidenceIds.includes(
                    item.evidenceId,
                  ),
              ),
          ),
        submissions:
          [
            ...submissions.values(),
          ].filter(
            (item) =>
              item.sessionId ===
              sessionId,
          ),
        consensus:
          [
            ...consensus.values(),
          ].filter(
            (item) =>
              item.sessionId ===
              sessionId,
          ),
        conflicts:
          [
            ...conflicts.values(),
          ].filter(
            (item) =>
              item.sessionId ===
              sessionId,
          ),
        certificates:
          [
            ...certificates.values(),
          ].filter(
            (item) =>
              item.sessionId ===
                sessionId &&
              item.fragranceId ===
                fragranceId,
          ),
      };
    },
  };
}

function assertUnlockedVersion(
  version:
    ReferenceCalibrationVersion |
    undefined,
) {
  if (!version) {
    throw new Error(
      "Reference calibration version does not exist.",
    );
  }

  if (
    version.lockedAt
  ) {
    throw new Error(
      "Reference calibration version is locked and cannot accept new claims.",
    );
  }
}

export type ReferenceLabRepository =
  ReturnType<
    typeof createReferenceLabRepository
  >;

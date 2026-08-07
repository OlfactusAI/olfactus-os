import type {
  ReferenceCalibrationSession,
} from "@/lib/reference-lab/types";
import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import {
  createCalibrationVersion,
} from "@/lib/reference-lab/versioning";

export function createReferenceCalibrationSession({
  fragranceId,
  brand,
  name,
  createdBy,
  createdAt,
  initialVersion = "1.0.0",
}: {
  fragranceId: string;
  brand: string;
  name: string;
  createdBy: string;
  createdAt: string;
  initialVersion?: string;
}) {
  const sessionId =
    createReferenceLabId(
      "ref-session",
      [
        fragranceId,
      ],
    );

  const version =
    createCalibrationVersion({
      sessionId,
      fragranceId,
      version:
        initialVersion,
      createdBy,
      createdAt,
    });

  const session:
    ReferenceCalibrationSession = {
      sessionId,
      fragranceId,
      brand,
      name,
      status:
        "draft",
      activeVersionId:
        version.versionId,
      reviewerIds: [
        createdBy,
      ],
      createdAt,
      createdBy,
      updatedAt:
        createdAt,
    };

  return {
    session,
    version,
  };
}

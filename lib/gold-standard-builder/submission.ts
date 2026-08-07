import {
  buildReviewPackagesFromDrafts,
} from "@/lib/gold-standard-builder/builder";
import {
  getDatasetAuthoringReadiness,
} from "@/lib/gold-standard-builder/authoring";
import type {
  GoldStandardDatasetBuildState,
} from "@/lib/gold-standard-builder/types";

export function submitDatasetReviewersTogether({
  state,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  timestamp: string;
}) {
  const readiness =
    getDatasetAuthoringReadiness(
      state,
    );

  if (
    !readiness.independent
  ) {
    throw new Error(
      "Reviewer drafts are not independent.",
    );
  }

  if (
    !readiness.allComplete
  ) {
    throw new Error(
      "Both reviewer drafts must be complete before submission.",
    );
  }

  return buildReviewPackagesFromDrafts({
    state,
    timestamp,
  });
}

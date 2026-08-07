"use client";

import {
  CircleHelp,
  ShieldCheck,
} from "lucide-react";

import type {
  CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";

export function CalibratedScoreDetails({
  calibration,
  compact = false,
}: {
  calibration:
    CalibratedIntelligenceScore;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "calibrated-score calibrated-score-compact"
          : "calibrated-score"
      }
      title={
        calibration.explanation
      }
    >
      <div className="calibrated-score-row">
        <span>
          <ShieldCheck
            size={13}
          />
          Confidence
        </span>
        <strong>
          {
            calibration.confidence
          }
          %
        </strong>
      </div>

      <div className="calibrated-score-row">
        <span>
          Expected range
        </span>
        <strong>
          {
            calibration.range[0]
          }
          –{
            calibration.range[1]
          }
        </strong>
      </div>

      {!compact ? (
        <>
          <div className="calibrated-score-row">
            <span>
              Evidence
            </span>
            <strong className="capitalize">
              {
                calibration.evidenceQuality
              }
            </strong>
          </div>

          <p>
            <CircleHelp
              size={12}
            />
            {
              calibration.explanation
            }
          </p>
        </>
      ) : null}
    </div>
  );
}

"use client";

import {
  Activity,
  Clock3,
  TrendingUp,
} from "lucide-react";

import type {
  IntelligenceOverlayData,
} from "@/lib/intelligence-everywhere/types";

export function IntelligenceOverlay({
  data,
}: {
  data:
    IntelligenceOverlayData;
}) {
  return (
    <div className="intelligence-overlay">
      <div>
        <small>
          Confidence
        </small>
        <strong>
          {
            data.confidence
          }
          %
        </strong>
      </div>
      <div>
        <small>
          Overlap
        </small>
        <strong>
          {
            data.overlap
          }
          %
        </strong>
      </div>
      <div>
        <small>
          Wear Score
        </small>
        <strong>
          {
            data.wearScoreToday
          }
        </strong>
      </div>
      <div>
        <small>
          Collection Rank
        </small>
        <strong>
          #
          {
            data.collectionRank
          }
        </strong>
      </div>
      <div>
        <small>
          Last Worn
        </small>
        <strong>
          {typeof data.lastWornDays ===
          "number"
            ? `${data.lastWornDays}d`
            : "—"}
        </strong>
      </div>
      <div>
        <small>
          Today
        </small>
        <strong className="capitalize">
          {
            data.recommendation
          }
        </strong>
      </div>
      <div>
        <small>
          Value
        </small>
        <strong className="capitalize">
          {
            data.valueTrend
          }
        </strong>
      </div>
    </div>
  );
}

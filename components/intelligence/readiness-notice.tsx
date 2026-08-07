"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  evaluateIntelligenceEligibility,
  type IntelligenceEngine,
} from "@/lib/intelligence/readiness-gateway";

export function IntelligenceReadinessNotice({
  fragrance,
  engine,
}: {
  fragrance: FragranceRecord;
  engine: IntelligenceEngine;
}) {
  const eligibility = evaluateIntelligenceEligibility(fragrance);

  if (eligibility.readiness === "ready") return null;

  const allowed = eligibility.allowedEngines.includes(engine);
  const Icon = allowed ? ShieldCheck : AlertTriangle;

  return (
    <div className={`intelligence-readiness-notice readiness-${eligibility.readiness}`}>
      <Icon size={16} />
      <div>
        <strong>
          {allowed ? "Limited confidence" : "Advanced scoring unavailable"}
        </strong>
        <p>{eligibility.warnings[0]}</p>
      </div>
      <span>{eligibility.confidence}% confidence</span>
    </div>
  );
}

export type RuntimeStatus = "inactive" | "active" | "superseded" | "revoked";

export interface RuntimeTraceability {
  researchPackId: string;
  reviewerPackageAId: string;
  reviewerPackageBId: string;
  consensusId: string;
  certificateId: string;
  registryId: string;
}

export interface RuntimeReference<TCalibration = Record<string, unknown>> {
  referenceId: string;
  fragranceId: string;
  referenceVersion: number;
  runtimeVersion: number;
  certificateId: string;
  consensusId: string;
  registryId: string;
  status: RuntimeStatus;
  activatedAt?: string;
  calibration: TCalibration;
  fingerprints: Record<string, string>;
  traceability: RuntimeTraceability;
}

export function isProductionReadable(reference: RuntimeReference): boolean {
  return reference.status === "active";
}

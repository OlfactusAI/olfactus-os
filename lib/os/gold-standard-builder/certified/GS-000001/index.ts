import provenance from "./provenance-binding-resolution.json";
import comparison from "./comparison.json";
import consensus from "./consensus.json";
import certificate from "./certificate.json";
import registryRecord from "./registry-record.json";
import productionFingerprints from "./production-fingerprints.json";
import promotionPackage from "./promotion-package.json";
import activationPackage from "./activation-package.json";
import runtimeReference from "./runtime-reference.json";
import activationChainManifest from "./activation-chain-manifest.json";

export const goldStandardReference001 = {
  referenceId: "GS-000001",
  fragranceId: "creed:aventus",
  state: "ACTIVE",
  provenance,
  comparison,
  consensus,
  certificate,
  registryRecord,
  productionFingerprints,
  promotionPackage,
  activationPackage,
  runtimeReference,
  activationChainManifest,
} as const;

export default goldStandardReference001;

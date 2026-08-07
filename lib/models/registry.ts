export type IntelligenceModelCategory =
  | "collection"
  | "recommendation"
  | "prediction"
  | "memory"
  | "graph"
  | "collector-state"
  | "calibration"
  | "simulation";

export interface IntelligenceModelDescriptor {
  id: string;
  name: string;
  version: string;
  category: IntelligenceModelCategory;
  status: "active" | "experimental" | "deprecated";
  description: string;
  introducedIn: string;
}

export const intelligenceModelRegistry: IntelligenceModelDescriptor[] = [
  {
    id: "COLLECTOR-STATE",
    name: "Canonical Collector State",
    version: "1.0.0",
    category: "collector-state",
    status: "active",
    description:
      "Builds one authoritative collector snapshot from collection, memory, preferences, predictions, and forecast state.",
    introducedIn: "4.0.0-alpha.1",
  },
  {
    id: "PIG",
    name: "Personal Intelligence Graph",
    version: "1.0.0",
    category: "graph",
    status: "active",
    description:
      "Creates the personal relationship graph layered over global fragrance entity identifiers.",
    introducedIn: "4.0.0-alpha.1",
  },
  {
    id: "PFL",
    name:
      "Personal Fragrance Language",
    version: "1.0.0",
    category:
      "recommendation",
    status: "active",
    description:
      "Interprets collector fragrance language, relative constraints, and descriptive vocabulary into structured scent-space targets.",
    introducedIn:
      "4.2.0-alpha.1",
  },
  {
    id: "PEM",
    name:
      "Preference Embedding",
    version: "1.0.0",
    category:
      "collector-state",
    status: "active",
    description:
      "Represents collector preference across a high-dimensional semantic fragrance space learned from ownership, wear, favorites, and ratings.",
    introducedIn:
      "4.2.0-alpha.1",
  },
  {
    id: "SEM",
    name:
      "Semantic Candidate Search",
    version: "1.0.0",
    category:
      "recommendation",
    status: "active",
    description:
      "Ranks global catalog candidates against interpreted natural-language constraints and the collector preference embedding.",
    introducedIn:
      "4.2.0-alpha.1",
  },
  {
    id: "UDC",
    name:
      "Unified Decision Core",
    version: "1.0.0",
    category:
      "recommendation",
    status: "active",
    description:
      "Produces one evidence-grounded BUY, SAMPLE, WAIT, SKIP, REPLACE, KEEP, REVISIT, or SELL decision from unified collector context.",
    introducedIn:
      "4.1.0-alpha.1",
  },
  {
    id: "REC",

    name: "Adaptive Recommendation",
    version: "4.1.0",
    category: "recommendation",
    status: "active",
    description:
      "Ranks fragrances from learned family, accord, drift, and performance evidence.",
    introducedIn: "3.0.0-alpha.1",
  },
  {
    id: "RET",
    name: "Retention Forecast",
    version: "1.2.0",
    category: "prediction",
    status: "active",
    description:
      "Estimates future bottle retention and neglect risk from collection and memory evidence.",
    introducedIn: "3.2.0-alpha.1",
  },
  {
    id: "SIG",
    name: "Signature Potential",
    version: "1.1.0",
    category: "prediction",
    status: "active",
    description:
      "Estimates signature potential using repeat use, affinity, favorites, and future rotation state.",
    introducedIn: "3.2.0-alpha.1",
  },
  {
    id: "TD",
    name: "Taste Drift",
    version: "2.0.0",
    category: "prediction",
    status: "active",
    description:
      "Compares older and recent wear DNA to detect longitudinal preference movement.",
    introducedIn: "3.0.0-alpha.1",
  },
  {
    id: "CF",
    name: "Collection Forecast",
    version: "3.2.0",
    category: "prediction",
    status: "active",
    description:
      "Forecasts Collection Health, rotation, role gaps, bottle states, DNA balance, and uncertainty over time.",
    introducedIn: "3.2.0-alpha.1",
  },
  {
    id: "MEM",
    name: "Behavioral Memory",
    version: "1.0.0",
    category: "memory",
    status: "active",
    description:
      "Stores structured collector events and derives repeated behavior evidence.",
    introducedIn: "2.5.0-alpha.1",
  },
  {
    id: "CAL",
    name: "Confidence Calibration",
    version: "1.1.0",
    category: "calibration",
    status: "active",
    description:
      "Calibrates predictive confidence from evidence volume and recommendation outcomes.",
    introducedIn: "3.0.0-alpha.1",
  },
  {
    id: "SIM",
    name: "Predictive Simulator",
    version: "3.1.0",
    category: "simulation",
    status: "active",
    description:
      "Forecasts long-term collection effects before a simulated change is applied.",
    introducedIn: "3.1.0-alpha.1",
  },
];

export function getIntelligenceModel(id: string) {
  return intelligenceModelRegistry.find((model) => model.id === id);
}

export function listActiveIntelligenceModels() {
  return intelligenceModelRegistry.filter((model) => model.status === "active");
}

export function intelligenceModelRef(id: string) {
  const model = getIntelligenceModel(id);
  return model ? `${model.id}-${model.version}` : `${id}-unknown`;
}

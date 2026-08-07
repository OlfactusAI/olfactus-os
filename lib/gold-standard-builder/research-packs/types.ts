export interface ReferenceResearchSource {
  sourceId: string;
  publisher: string;
  sourceType: string;
  url: string;
  accessedAt: string;
  weight:
    | "primary"
    | "secondary";
}

export interface ReferenceResearchFact {
  factId: string;
  category: string;
  claim: string;
  sourceIds: string[];
  confidence: number;
}

export interface ReferenceResearchPack {
  researchPackId: string;
  fragranceId: string;
  brand: string;
  name: string;
  edition: string;
  researchedAt: string;
  policy: {
    scoresIncluded: boolean;
    purpose: string;
    warning: string;
  };
  sources:
    ReferenceResearchSource[];
  facts:
    ReferenceResearchFact[];
  sectionEvidence:
    Record<
      string,
      string[]
    >;
  reviewerCautions:
    string[];
}

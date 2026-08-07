export type AnalystEvidenceKind =
  | "verified"
  | "calculated"
  | "estimated"
  | "unavailable";

export interface AnalystEvidence {
  kind:
    AnalystEvidenceKind;
  label: string;
  detail: string;
}

export type AnalystResponse =
  | {
      type:
        "health-explanation";
      title: string;
      score: number;
      confidence: number;
      positives: string[];
      negatives: string[];
      evidence:
        AnalystEvidence[];
    }
  | {
      type:
        "recommendation";
      title: string;
      fragranceId?: string;
      fragranceName?: string;
      brand?: string;
      score?: number;
      confidence: number;
      summary: string;
      evidence:
        AnalystEvidence[];
    }
  | {
      type:
        "neglected";
      title: string;
      items:
        Array<{
          fragranceId: string;
          fragranceName: string;
          brand: string;
          days: number;
        }>;
      evidence:
        AnalystEvidence[];
    }
  | {
      type:
        "comparison";
      title: string;
      entities:
        Array<{
          id: string;
          name: string;
          subtitle: string;
          confidence: number;
          connections: number;
          collectionStatus:
            "owned"
            | "not-owned";
        }>;
      evidence:
        AnalystEvidence[];
    }
  | {
      type:
        "message";
      title: string;
      message: string;
      evidence:
        AnalystEvidence[];
    };

export interface AnalystActionPreview {
  id: string;
  action:
    "record-wear";
  title: string;
  summary: string;
  fragranceId: string;
  fragranceName: string;
  createdAt: string;
  expectedEffects:
    string[];
}

export interface AnalystActivity {
  id: string;
  kind:
    | "query"
    | "response"
    | "action-proposed"
    | "action-confirmed"
    | "action-canceled";
  summary: string;
  confidence?: number;
  createdAt: string;
  metadata:
    Record<
      string,
      string | number | boolean | undefined
    >;
}

export interface AnalystCommand {
  intent:
    | "explain-health"
    | "recommend-owned"
    | "find-neglected"
    | "compare"
    | "record-wear"
    | "help";
  raw: string;
  arguments:
    string[];
}

export interface CuratedPerfumerAttribution {
  fragranceId: string;
  perfumers: string[];
  confidence: number;
  status: "curated" | "undisclosed";
  note?: string;
}

export const curatedPerfumerAttributions:
  CuratedPerfumerAttribution[] = [
    {
      fragranceId: "imagination",
      perfumers: [
        "Jacques Cavallier Belletrud",
      ],
      confidence: 98,
      status: "curated",
    },
    {
      fragranceId: "ganymede",
      perfumers: ["Quentin Bisch"],
      confidence: 98,
      status: "curated",
    },
    {
      fragranceId: "grand-soir",
      perfumers: [
        "Francis Kurkdjian",
      ],
      confidence: 98,
      status: "curated",
    },
    {
      fragranceId: "prada-lhomme",
      perfumers: ["Daniela Andrier"],
      confidence: 98,
      status: "curated",
    },
    {
      fragranceId: "terre",
      perfumers: [
        "Jean-Claude Ellena",
      ],
      confidence: 98,
      status: "curated",
    },
    {
      fragranceId: "un-air",
      perfumers: [
        "Juliette Karagueuzoglou",
      ],
      confidence: 95,
      status: "curated",
    },
    {
      fragranceId: "naxos",
      perfumers: [],
      confidence: 100,
      status: "undisclosed",
      note:
        "The perfumer is not identified in the current curated OLFACTUS dataset.",
    },
    {
      fragranceId: "bottled-absolu",
      perfumers: [],
      confidence: 100,
      status: "undisclosed",
      note:
        "The perfumer attribution is intentionally left unassigned pending verified source data.",
    },
  ];

export function getCuratedPerfumerAttribution(
  fragranceId: string,
) {
  return curatedPerfumerAttributions.find(
    (item) =>
      item.fragranceId ===
      fragranceId,
  );
}

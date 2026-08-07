import type {
  LineageRegistry,
} from "@/lib/lineage/registry";

export const curatedLineageRegistry:
  LineageRegistry = {
    lines: [
      {
        id: "line-demo-bleu",
        canonicalName:
          "Bleu de Chanel",
        brandId:
          "brand-chanel",
        originalFragranceId:
          "bleu-de-chanel-edt",
        memberIds: [
          "bleu-de-chanel-edt",
          "bleu-de-chanel-edp",
          "bleu-de-chanel-parfum",
        ],
        confidence: 99,
        source: "curated",
      },
      {
        id: "line-demo-sauvage",
        canonicalName:
          "Dior Sauvage",
        brandId:
          "brand-dior",
        originalFragranceId:
          "dior-sauvage-edt",
        memberIds: [
          "dior-sauvage-edt",
          "dior-sauvage-edp",
          "dior-sauvage-parfum",
          "dior-sauvage-elixir",
        ],
        confidence: 99,
        source: "curated",
      },
    ],
    metadata: [
      {
        fragranceId:
          "bleu-de-chanel-edt",
        lineId:
          "line-demo-bleu",
        generation: 0,
        releaseOrder: 1,
        relationship:
          "original",
        status: "active",
        concentrationId:
          "eau-de-toilette",
        successorId:
          "bleu-de-chanel-edp",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "bleu-de-chanel-edp",
        lineId:
          "line-demo-bleu",
        parentId:
          "bleu-de-chanel-edt",
        generation: 1,
        releaseOrder: 2,
        relationship:
          "flanker",
        status: "active",
        concentrationId:
          "eau-de-parfum",
        predecessorId:
          "bleu-de-chanel-edt",
        successorId:
          "bleu-de-chanel-parfum",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "bleu-de-chanel-parfum",
        lineId:
          "line-demo-bleu",
        parentId:
          "bleu-de-chanel-edt",
        generation: 1,
        releaseOrder: 3,
        relationship:
          "successor",
        status: "active",
        concentrationId:
          "parfum",
        predecessorId:
          "bleu-de-chanel-edp",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "dior-sauvage-edt",
        lineId:
          "line-demo-sauvage",
        generation: 0,
        releaseOrder: 1,
        relationship:
          "original",
        status: "active",
        concentrationId:
          "eau-de-toilette",
        successorId:
          "dior-sauvage-edp",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "dior-sauvage-edp",
        lineId:
          "line-demo-sauvage",
        parentId:
          "dior-sauvage-edt",
        generation: 1,
        releaseOrder: 2,
        relationship:
          "flanker",
        status: "active",
        concentrationId:
          "eau-de-parfum",
        predecessorId:
          "dior-sauvage-edt",
        successorId:
          "dior-sauvage-parfum",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "dior-sauvage-parfum",
        lineId:
          "line-demo-sauvage",
        parentId:
          "dior-sauvage-edt",
        generation: 1,
        releaseOrder: 3,
        relationship:
          "flanker",
        status: "active",
        concentrationId:
          "parfum",
        predecessorId:
          "dior-sauvage-edp",
        successorId:
          "dior-sauvage-elixir",
        confidence: 99,
        source: "curated",
      },
      {
        fragranceId:
          "dior-sauvage-elixir",
        lineId:
          "line-demo-sauvage",
        parentId:
          "dior-sauvage-edt",
        generation: 2,
        releaseOrder: 4,
        relationship:
          "successor",
        status: "active",
        concentrationId:
          "elixir",
        predecessorId:
          "dior-sauvage-parfum",
        confidence: 99,
        source: "curated",
      },
    ],
  };

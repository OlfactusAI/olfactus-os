import type {
  CatalogImportRow,
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  previewCatalogImport,
} from "@/lib/catalog-v2/import-engine";
import {
  createCatalogStagingStore,
} from "@/lib/catalog-v2/staging/store";
import {
  activateCatalogV2Batch,
} from "@/lib/catalog-v2/activation/bridge";

export interface OfficialSourceBatchDescriptor {
  id: string;
  house: string;
  sourceName: string;
  sourceUrl: string;
  confidence: number;
  rows: CatalogImportRow[];
}

export const officialSourceBatch001 =
[
  {
    "id": "creed-aventus-official",
    "house": "Creed",
    "sourceName": "Creed Boutique — Aventus",
    "sourceUrl": "https://creedboutique.com/products/aventus",
    "confidence": 99,
    "rows": [
      {
        "brand": "Creed",
        "name": "Aventus",
        "concentration": "Eau de Parfum",
        "family": "Dry Woods, Fresh, Citrus & Fruity",
        "notes": [
          "Calabrian bergamot",
          "Pineapple accord",
          "Birch",
          "Musk"
        ],
        "country": "United Kingdom"
      }
    ]
  },
  {
    "id": "creed-green-irish-tweed-official",
    "house": "Creed",
    "sourceName": "Creed Boutique — Green Irish Tweed",
    "sourceUrl": "https://creedboutique.com/products/green-irish-tweed",
    "confidence": 99,
    "rows": [
      {
        "brand": "Creed",
        "name": "Green Irish Tweed",
        "concentration": "Eau de Parfum",
        "family": "Aromatic Fougère, Green & Mossy Woods",
        "notes": [
          "Bergamot",
          "Lemon",
          "Peppermint"
        ],
        "country": "United Kingdom"
      }
    ]
  },
  {
    "id": "creed-silver-mountain-water-official",
    "house": "Creed",
    "sourceName": "Creed Boutique — Silver Mountain Water",
    "sourceUrl": "https://creedboutique.com/products/silver-mountain-water",
    "confidence": 99,
    "rows": [
      {
        "brand": "Creed",
        "name": "Silver Mountain Water",
        "concentration": "Eau de Parfum",
        "family": "Citrus, Fruity & Woody",
        "notes": [
          "Bergamot",
          "Blackcurrant",
          "Tea",
          "Ozonic accord"
        ],
        "country": "United Kingdom"
      }
    ]
  },
  {
    "id": "dior-sauvage-edt-official",
    "house": "Dior",
    "sourceName": "Dior — Sauvage Eau de Toilette",
    "sourceUrl": "https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-Y0685240.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Dior",
        "name": "Sauvage Eau de Toilette",
        "concentration": "Eau de Toilette",
        "family": "Fresh, Citrus & Woody",
        "notes": [
          "Citrus",
          "Ambroxan",
          "Elemi",
          "Woods"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "dior-sauvage-edp-official",
    "house": "Dior",
    "sourceName": "Dior — Sauvage Eau de Parfum",
    "sourceUrl": "https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-C099600180.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Dior",
        "name": "Sauvage Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Citrus & Vanilla",
        "notes": [
          "Calabrian bergamot",
          "Papua New Guinean vanilla extract",
          "Patchouli"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "dior-sauvage-parfum-official",
    "house": "Dior",
    "sourceName": "Dior — Sauvage Parfum",
    "sourceUrl": "https://www.dior.com/en_us/beauty/products/sauvage-parfum-Y0998004.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Dior",
        "name": "Sauvage Parfum",
        "concentration": "Parfum",
        "family": "Citrus & Woody",
        "notes": [
          "Mandarin",
          "Sandalwood"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "dior-sauvage-elixir-official",
    "house": "Dior",
    "sourceName": "Dior — Sauvage Elixir",
    "sourceUrl": "https://www.dior.com/en_us/beauty/products/sauvage-elixir-E000000932.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Dior",
        "name": "Sauvage Elixir",
        "concentration": "Elixir",
        "family": "Spicy, Fresh & Woody",
        "notes": [
          "Grapefruit",
          "Spices",
          "Lavender",
          "Rich woods"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "chanel-bleu-edt-official",
    "house": "Chanel",
    "sourceName": "Chanel — BLEU DE CHANEL Eau de Toilette",
    "sourceUrl": "https://www.chanel.com/us/fragrance/p/107460/bleu-de-chanel-eau-de-toilette-spray/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Chanel",
        "name": "BLEU DE CHANEL Eau de Toilette",
        "concentration": "Eau de Toilette",
        "family": "Aromatic Woody",
        "notes": [
          "Citrus",
          "Aromatic accord",
          "Cedar",
          "New Caledonian sandalwood"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "chanel-bleu-edp-official",
    "house": "Chanel",
    "sourceName": "Chanel — BLEU DE CHANEL Eau de Parfum",
    "sourceUrl": "https://www.chanel.com/us/fragrance/p/107350/bleu-de-chanel-eau-de-parfum-spray/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Chanel",
        "name": "BLEU DE CHANEL Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Aromatic Woody",
        "notes": [
          "Amber",
          "Musk",
          "Woods"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "chanel-bleu-parfum-official",
    "house": "Chanel",
    "sourceName": "Chanel — BLEU DE CHANEL Parfum",
    "sourceUrl": "https://www.chanel.com/us/fragrance/p/107180/bleu-de-chanel-parfum-spray/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Chanel",
        "name": "BLEU DE CHANEL Parfum",
        "concentration": "Parfum",
        "family": "Woody Aromatic",
        "country": "France"
      }
    ]
  },
  {
    "id": "hermes-terre-edt-official",
    "house": "Hermès",
    "sourceName": "Hermès — Terre d'Hermès Eau de Toilette",
    "sourceUrl": "https://www.hermes.com/us/en/product/terre-d-hermes-eau-de-toilette-V107189V0/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Hermès",
        "name": "Terre d'Hermès Eau de Toilette",
        "concentration": "Eau de Toilette",
        "family": "Mineral Woody",
        "notes": [
          "Cedar",
          "Grapefruit",
          "Flint"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "hermes-terre-parfum-official",
    "house": "Hermès",
    "sourceName": "Hermès — Terre d'Hermès Parfum",
    "sourceUrl": "https://www.hermes.com/us/en/product/terre-d-hermes-parfum-V107757V0/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Hermès",
        "name": "Terre d'Hermès Parfum",
        "concentration": "Parfum",
        "family": "Warm Woody",
        "notes": [
          "Cedar",
          "Grapefruit",
          "Shiso"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "amouage-jubilation-xxv-official",
    "house": "Amouage",
    "sourceName": "Amouage — Jubilation XXV Man",
    "sourceUrl": "https://amouage.com/products/jubilation-xxv-man",
    "confidence": 99,
    "rows": [
      {
        "brand": "Amouage",
        "name": "Jubilation XXV Man",
        "concentration": "Eau de Parfum",
        "family": "Woody",
        "country": "Oman"
      }
    ]
  },
  {
    "id": "amouage-interlude-53-official",
    "house": "Amouage",
    "sourceName": "Amouage — Interlude 53 Man",
    "sourceUrl": "https://amouage.com/products/interlude-53-man",
    "confidence": 99,
    "rows": [
      {
        "brand": "Amouage",
        "name": "Interlude 53 Man",
        "concentration": "Extrait de Parfum",
        "notes": [
          "Bergamot",
          "Oregano",
          "Pimento berry"
        ],
        "country": "Oman"
      }
    ]
  },
  {
    "id": "xerjoff-current-collection-official",
    "house": "Xerjoff",
    "sourceName": "Xerjoff — Current Perfume Collection",
    "sourceUrl": "https://www.xerjoff.com/collections/xerjoff-perfumes",
    "confidence": 98,
    "rows": [
      {
        "brand": "Xerjoff",
        "name": "Naxos",
        "concentration": "Perfume",
        "country": "Italy"
      },
      {
        "brand": "Xerjoff",
        "name": "Erba Pura",
        "concentration": "Perfume",
        "country": "Italy"
      },
      {
        "brand": "Xerjoff",
        "name": "Torino21",
        "concentration": "Perfume",
        "country": "Italy"
      },
      {
        "brand": "Xerjoff",
        "name": "Avanguardia",
        "concentration": "Perfume",
        "country": "Italy"
      },
      {
        "brand": "Xerjoff",
        "name": "Erba Gold",
        "concentration": "Perfume",
        "country": "Italy"
      }
    ]
  },
  {
    "id": "parfums-de-marly-masculine-discovery-official",
    "house": "Parfums de Marly",
    "sourceName": "Parfums de Marly — Masculine Discovery Set",
    "sourceUrl": "https://us.parfums-de-marly.com/products/masculine-discovery-set",
    "confidence": 99,
    "rows": [
      {
        "brand": "Parfums de Marly",
        "name": "Castley",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Althaïr",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Haltane",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Layton",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Pegasus",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Percival",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Parfums de Marly",
        "name": "Oajan",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      }
    ]
  },
  {
    "id": "mfk-unisex-official",
    "house": "Maison Francis Kurkdjian",
    "sourceName": "Maison Francis Kurkdjian — Unisex Fragrances",
    "sourceUrl": "https://www.franciskurkdjian.com/us-en/fragrances/unisex-fragrances/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "Baccarat Rouge 540 Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Woody Ambery Floral",
        "genderPositioning": "Unisex",
        "country": "France"
      },
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "Baccarat Rouge 540 Extrait de Parfum",
        "concentration": "Extrait de Parfum",
        "family": "Ambery Floral",
        "genderPositioning": "Unisex",
        "country": "France"
      },
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "Cologne Pour le Matin",
        "concentration": "Eau de Cologne",
        "family": "Aromatic Citrus",
        "genderPositioning": "Unisex",
        "country": "France"
      },
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "Cologne Pour le Soir",
        "concentration": "Eau de Cologne",
        "genderPositioning": "Unisex",
        "country": "France"
      },
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "OUD satin mood",
        "concentration": "Eau de Parfum",
        "family": "Ambery Woody Floral",
        "genderPositioning": "Unisex",
        "country": "France"
      },
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "724",
        "concentration": "Eau de Parfum",
        "family": "Musky Floral",
        "genderPositioning": "Unisex",
        "country": "France"
      }
    ]
  },
  {
    "id": "mfk-grand-soir-official",
    "house": "Maison Francis Kurkdjian",
    "sourceName": "Maison Francis Kurkdjian — Grand Soir",
    "sourceUrl": "https://www.franciskurkdjian.com/us-en/p/grand-soir-eau-de-parfum-RA122521.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "Grand Soir",
        "concentration": "Eau de Parfum",
        "family": "Ambery Woody",
        "genderPositioning": "Unisex",
        "country": "France"
      }
    ]
  },
  {
    "id": "mfk-gentle-fluidity-gold-official",
    "house": "Maison Francis Kurkdjian",
    "sourceName": "Maison Francis Kurkdjian — gentle Fluidity Gold",
    "sourceUrl": "https://www.franciskurkdjian.com/us-en/p/gentle-fluidity-gold-edition---eau-de-parfum-RA122821.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Maison Francis Kurkdjian",
        "name": "gentle Fluidity Gold",
        "concentration": "Eau de Parfum",
        "family": "Musky Ambery",
        "genderPositioning": "Unisex",
        "notes": [
          "Coriander seeds",
          "Musks",
          "Vanilla",
          "Amber wood"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "montale-arabians-tonka-official",
    "house": "Montale",
    "sourceName": "Montale — Arabians Tonka",
    "sourceUrl": "https://montaleparfums.com/en/oriental/282-arabians-tonka.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Montale",
        "name": "Arabians Tonka",
        "concentration": "Eau de Parfum",
        "family": "Oriental",
        "notes": [
          "Tonka",
          "Rose",
          "Bergamot",
          "Oud",
          "Leather"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "montale-intense-cafe-official",
    "house": "Montale",
    "sourceName": "Montale — Intense Café",
    "sourceUrl": "https://montaleparfums.com/en/gourmand/176-intense-cafe.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Montale",
        "name": "Intense Café",
        "concentration": "Eau de Parfum",
        "family": "Gourmand",
        "notes": [
          "Floral notes",
          "Rose",
          "Coffee",
          "Amber",
          "Vanilla",
          "White musk"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "bdk-gris-charnel-official",
    "house": "BDK Parfums",
    "sourceName": "BDK Parfums — Gris Charnel",
    "sourceUrl": "https://bdkparfums.com/en/products/gris-charnel",
    "confidence": 99,
    "rows": [
      {
        "brand": "BDK Parfums",
        "name": "Gris Charnel",
        "concentration": "Eau de Parfum",
        "family": "Woody, Spicy & Powdery",
        "perfumers": [
          "Mathilde Bijaoui"
        ],
        "notes": [
          "Fig",
          "Black tea",
          "Cardamom essence",
          "Iris absolute",
          "Bourbon vetiver",
          "Indian sandalwood",
          "Tonka bean absolute"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "bdk-pas-ce-soir-official",
    "house": "BDK Parfums",
    "sourceName": "BDK Parfums — Pas ce Soir",
    "sourceUrl": "https://bdkparfums.com/en/products/pas-ce-soir",
    "confidence": 99,
    "rows": [
      {
        "brand": "BDK Parfums",
        "name": "Pas ce Soir",
        "concentration": "Eau de Parfum",
        "family": "Fruity, Spicy & Woody",
        "perfumers": [
          "Violaine Collas"
        ],
        "notes": [
          "Black pepper",
          "Ginger",
          "Mandarin",
          "Pear",
          "Moroccan jasmine",
          "Quince chutney",
          "Orange blossom",
          "Cashmeran",
          "Singaporean patchouli",
          "Amber wood"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "bdk-rouge-smoking-official",
    "house": "BDK Parfums",
    "sourceName": "BDK Parfums — Rouge Smoking",
    "sourceUrl": "https://bdkparfums.com/products/rouge-smoking",
    "confidence": 99,
    "rows": [
      {
        "brand": "BDK Parfums",
        "name": "Rouge Smoking",
        "concentration": "Eau de Parfum",
        "family": "Fruity, Ambery & Spicy",
        "perfumers": [
          "Amélie Bourgeois"
        ],
        "notes": [
          "Italian bergamot",
          "Cherry accord",
          "Pink berries",
          "Black vanilla",
          "Heliotrope",
          "Ambroxan",
          "Cashmeran",
          "Tonka bean",
          "Labdanum",
          "White musk"
        ],
        "country": "France"
      }
    ]
  }
] satisfies OfficialSourceBatchDescriptor[];

export function countOfficialSourceBatch001Rows() {
  return officialSourceBatch001.reduce(
    (total, source) => total + source.rows.length,
    0,
  );
}

export function getOfficialSourceBatch001Houses() {
  return [
    ...new Set(
      officialSourceBatch001.map((source) => source.house),
    ),
  ];
}

export function previewOfficialSourceBatch001({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const previews =
    officialSourceBatch001.map(
      (source) => {
        const provenance =
          buildProvenance(source);

        return {
          source,
          preview:
            previewCatalogImport({
              rows: source.rows,
              provenance,
              existing,
            }),
        };
      },
    );

  return {
    sources: previews.length,
    houses: getOfficialSourceBatch001Houses(),
    incoming: countOfficialSourceBatch001Rows(),
    accepted: previews.reduce(
      (total, item) =>
        total + item.preview.accepted.length,
      0,
    ),
    rejected: previews.reduce(
      (total, item) =>
        total + item.preview.rejected.length,
      0,
    ),
    duplicateCandidates:
      previews.flatMap(
        (item) =>
          item.preview.duplicateCandidates,
      ),
    records:
      previews.flatMap(
        (item) =>
          item.preview.accepted,
      ),
  };
}

export function stageOfficialSourceBatch001({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const preview =
    previewOfficialSourceBatch001({ existing });
  const staging =
    createCatalogStagingStore();

  const staged =
    preview.records.map(
      (record) =>
        staging.stage({ record }),
    );

  return {
    ...preview,
    staging,
    staged,
  };
}

export function activateOfficialSourceBatch001({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const staged =
    stageOfficialSourceBatch001({ existing });

  const activation =
    activateCatalogV2Batch({
      records: staged.staged,
    });

  const levels =
    activation.activated.reduce(
      (output, entity) => {
        output[entity.level] =
          (output[entity.level] ?? 0) + 1;
        return output;
      },
      {} as Record<string, number>,
    );

  return {
    ...staged,
    activation,
    levels,
  };
}

function buildProvenance(
  source: OfficialSourceBatchDescriptor,
): CatalogSourceProvenance {
  return {
    sourceId: source.id,
    sourceKind: "curated",
    sourceName: source.sourceName,
    importedAt: "2026-08-07T21:30:00.000Z",
    retrievedAt: "2026-08-07T21:30:00.000Z",
    sourceUrl: source.sourceUrl,
    confidence: source.confidence,
  };
}
